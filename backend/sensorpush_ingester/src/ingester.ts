import got, { HTTPError, Response } from "got";
import assert from "assert";

import { rootLogger } from "./logger";
import { latestTime } from "./db";

const logger = rootLogger.child({ module: "ingester" });

const client = got.extend({ prefixUrl: "https://api.sensorpush.com/api/v1", responseType: "json" });

interface Authorizer {
  (reauthorize?: boolean): Promise<string>;
}

export function isResponseError(error: unknown): error is HTTPError {
  return (error as HTTPError).response !== undefined;
}

interface AuthorizationResponse {
  authorization: string;
}

interface AccessTokenResponse {
  accesstoken: string;
}

class AuthorizationFetcher {
  authorizing = false;
  authorization: Promise<string>;

  constructor(private email: string, private password: string) {
    this.authorization = this.authorize(true);
  }

  async fetchAuthorizationToken() {
    let resp: Response<AuthorizationResponse> | undefined;
    while (resp === undefined) {
      try {
        resp = await client.post("oauth/authorize", {
          json: {
            email: this.email,
            password: this.password,
          },
          responseType: "json",
        });
      } catch (error) {
        if (!isResponseError(error)) {
          throw error;
        }
        if (error.response.statusCode === 403) {
          logger.warn("Got 403 auth error with this data: %O", error.response.body);
          throw error;
        }
      }
    }
    return resp.body.authorization;
  }

  authorize = async (reauthorize = false): Promise<string> => {
    if (!reauthorize || this.authorizing) {
      return this.authorization;
    }
    this.authorizing = true;
    const authorizationToken = await this.fetchAuthorizationToken();
    const access: Response<AccessTokenResponse> = await client.post("oauth/accesstoken", {
      json: { authorization: authorizationToken },
      responseType: "json",
    });
    const accessToken = access.body.accesstoken;
    if (accessToken === null) {
      throw new Error("SensorPush returned a null access token, the dickenses");
    }
    this.authorizing = false;
    return accessToken;
  };
}

export function createAuthorizer(email: string, password: string): Authorizer {
  return new AuthorizationFetcher(email, password).authorize;
}

interface Sensor {
  id: string;
  active: boolean;
}

interface Sample {
  temperature: number;
  observed: string;
  humidity: number;
}

export interface Samples {
  id: string;
  samples: Sample[];
}

interface SamplesData {
  total_samples: number;
  last_time: string;
  sensors: { [id: string]: Sample[] };
}

export async function* backfiller(
  id: string,
  authorizer: Authorizer,
  latestTime: (x: string) => Promise<Date | undefined>
): AsyncGenerator<Samples, void, void> {
  logger.info("Fetching %d", id);
  while (true) {
    let nextStartTime = "";
    const lastTime = await latestTime(id);
    if (lastTime !== undefined) {
      nextStartTime = new Date(lastTime.getTime() + 1_000).toISOString();
    }
    const resp: Response<SamplesData> = await client.post("samples", {
      headers: { Authorization: await authorizer() },
      json: { startTime: nextStartTime, limit: 1_000, sensors: [id] },
      responseType: "json",
    });
    logger.debug("HTTP Status %d", resp.statusCode);
    const data = resp.body;
    if (data.total_samples === 0) {
      return;
    }
    assert.ok(
      Object.prototype.hasOwnProperty.call(data.sensors, id),
      `Expected requested device id ${id} to be present in sensors`
    );
    yield { id: id, samples: data.sensors[id] };
  }
}

interface Sensors {
  [id: string]: Sensor;
}

export async function* ingest(
  email: string,
  password: string
): AsyncGenerator<Samples, void, void> {
  yield* fetchLatest(createAuthorizer(email, password));
}

export async function* fetchLatest(authorizer: Authorizer): AsyncGenerator<Samples, void, void> {
  const sensors: Response<Sensors> = await client.post("devices/sensors", {
    json: { active: true },
    headers: { Authorization: await authorizer() },
    responseType: "json",
  });

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
  for (const sensor of Object.values(sensors.body)) {
    yield* backfiller(sensor.id, authorizer, latestTime);
  }
}
