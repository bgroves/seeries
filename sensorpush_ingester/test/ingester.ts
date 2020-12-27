import baretest from 'baretest';
import assert from 'assert';
import nock from 'nock';

import {createAuthorizer} from '../src/ingester'
import { AxiosError } from 'axios';

const test = baretest('ingester');

const ACCEPTED_EMAIL = "real_user@example.com";
const ACCEPTED_PASSWORD = "correct_password";
const AUTHORIZED_AUTHORIZATION_CODE = "iamnotarealauthorizationcode"
const AUTHORIZED_ACCESS_TOKEN = "iamnotarealaccesstoken"

function nockAuth() {
    nock('https://api.sensorpush.com')
    .post('/api/v1/oauth/authorize', {"email":ACCEPTED_EMAIL, "password":ACCEPTED_PASSWORD})
    .reply(200, {"authorization":AUTHORIZED_AUTHORIZATION_CODE}, [ 'Content-Type', 'application/json']);

    nock('https://api.sensorpush.com')
    .post('/api/v1/oauth/accesstoken', {"authorization":AUTHORIZED_AUTHORIZATION_CODE})
    .reply(200, {"accesstoken":AUTHORIZED_ACCESS_TOKEN},[ 'Content-Type', 'application/json', ]);
}

test('Working auth', async () => {
    nockAuth();
    const authorizer = createAuthorizer(ACCEPTED_EMAIL, ACCEPTED_PASSWORD);
    const auth = await authorizer();
    assert.strictEqual(AUTHORIZED_ACCESS_TOKEN, auth);
});


function isAxiosError(error: unknown): error is AxiosError {
    return (error as AxiosError).isAxiosError !== undefined;
}

function isMessage(data: unknown): data is {message: string} {
    return (data as {message: string}).message !== undefined;
}

test('Wrong email', async () => {
    const badEmail = "not_real_user@example.com";
    nock('https://api.sensorpush.com')
      .post('/api/v1/oauth/authorize', {"email":badEmail, "password":ACCEPTED_PASSWORD})
      .reply(403, {"message":"invalid user"}, [ 'Content-Type', 'application/json',]);
    const authorizer = createAuthorizer(badEmail, ACCEPTED_PASSWORD);
    try {
        await authorizer();
    } catch (error) {
        if (isAxiosError(error)) {
            assert.strictEqual(error.response?.status, 403);
            if (isMessage(error.response?.data)) {
                assert.strictEqual(error.response.data.message, "invalid user");
                return;
            }
        }
        throw error;
        
    }
    assert.fail("Expected request without start to raise a 403")
});

void test.run()


