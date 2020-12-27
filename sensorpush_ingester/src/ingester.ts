import axios, { AxiosError, AxiosResponse } from 'axios';

import {rootLogger} from './logger';

const logger = rootLogger.child({module: 'ingester'});

const client = axios.create({baseURL: "https://api.sensorpush.com/api/v1"});

interface Authorizer {
    (reauthorize?: boolean): Promise<string>;
}

function isAxiosError(error: unknown): error is AxiosError {
    return (error as AxiosError).isAxiosError !== undefined;
}

interface AuthorizationResponse {
    authorization: string,
}


function isMessage(data: unknown): data is {message: string|undefined} {
    return (data as {message: string}).message !== undefined;
}
class AuthorizationFetcher {
    authorizing = false;
    authorization :Promise<string>;

    constructor(private email: string, private password: string) {
        this.authorization = this.authorize(true);
    }

    async fetchAuthorizationToken() {
        let resp :AxiosResponse<AuthorizationResponse> | undefined;
        while (resp === undefined) {
            try {
                resp = await client.post("/oauth/authorize", {"email": this.email, "password": this.password});
            } catch (error) {
                if (!isAxiosError(error)) {
                    throw error;
                }
                if (error.response?.status === 403) {
                    logger.warn("Got 403 auth error with this data: %O", error.response.data);
                    if (isMessage(error.response.data)) {
                    error.response.data.message = undefined;
                    }
                    throw error;
                }
            }
        }
        return resp.data.authorization;
    }

    authorize = async (reauthorize=false):Promise<string> => {
        if (!reauthorize || this.authorizing) {
            return this.authorization;
        }
        this.authorizing = true;
        const authorizationToken = await this.fetchAuthorizationToken();
        const access :AxiosResponse<{accesstoken: string}> = await client.post("/oauth/accesstoken", {"authorization": authorizationToken});
        const accessToken = access.data.accesstoken;       
        if (accessToken === null) {
            throw new Error("SensorPush returned a null access token, the dickenses");
        }
        this.authorizing = false;
        return accessToken;
    }
}

export function createAuthorizer(email: string, password: string):Authorizer {
    return new AuthorizationFetcher(email, password).authorize
}

interface Sensor {
    id: string,
    active: boolean
}

interface Sample {
    temperature: number,
    observed: string,
    humidity: number
}

interface Samples {
    id: string,
    samples: Sample[]
}

interface SamplesData {
    total_samples: number,
    last_time: string,
    sensors: {[id: string]: Sample[]},
}

async function* backfiller(id: string, authorizer: Authorizer): AsyncGenerator<Samples, void, void> {
    logger.info("Fetching %d", id);
    let nextStartTime = "";
    while (true) {
        const resp :AxiosResponse<SamplesData> = await client.post("/samples", {"startTime": nextStartTime, "limit":1_000, "sensors": [id]}, {headers:{"Authorization": await authorizer()}});
        logger.debug("HTTP Status %d", resp.status);
        const data = resp.data;
        if (data.total_samples === 0) {
            return;
        }
        if (!/^\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d\.\d\d\dZ$/.test(data.last_time)) {
            throw new Error(`'last_time' must be an date time string with full time precision and a 'Z' time zone(https://www.ecma-international.org/ecma-262/11.0/#sec-date.parse), not '${data.last_time}'`);
        }
        const lastTime = new Date(data.last_time);
        yield {id: id, samples: data.sensors[id]};
        
        nextStartTime = new Date(lastTime.getTime() + 1_000).toISOString();
    }
}

export async function* ingest(email: string, password: string): AsyncGenerator<Samples, void, void> {
    const authorizer = createAuthorizer(email, password);
    const sensors :AxiosResponse<{[id: string]: Sensor}> = await client.post('/devices/sensors', {'active':true}, {headers:{"Authorization": await authorizer()}});

    // Would be great to run these backfills in parallel. A quick test with 6 sensors shows it taking 7 seconds in parallel as opposed 
    // to 28 doing it serially as it is now. 
    // 
    // JavaScript doesn't make that easy as far as I can tell. I think we'd need to do something like: 
    // make an array of Promises out of the first item to come out of the generators
    // execute Promise.race on that array
    // yield the first object to come back
    // Remove the Promise that produced the yielded object from the array
    // If the generator that produced the yielded object has a next, insert that Promise into the array
    // Continue racing and yielding till the Promise array is empty.
    // 
    // Yuck.
    for (const sensor of Object.values(sensors.data)) {
        yield *backfiller(sensor.id, authorizer);
    }
}