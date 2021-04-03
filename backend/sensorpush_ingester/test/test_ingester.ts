import assert from "assert";
import nock from "nock";

import {
  createAuthorizer,
  backfiller,
  Samples,
  fetchLatest,
  isResponseError,
} from "../src/ingester";
import { Caretest } from "../../shared/src/caretest";
import { ephemerally } from "../../shared/src/db";
import { insert } from "../src/db";

const suite = new Caretest("ingester");
export default suite;

const ACCEPTED_EMAIL = "real_user@example.com";
const ACCEPTED_PASSWORD = "correct_password";
const AUTHORIZED_AUTHORIZATION_CODE = "iamnotarealauthorizationcode";
const AUTHORIZED_ACCESS_TOKEN = "iamnotarealaccesstoken";
const DEVICE_ID = "123.456789";

function nockAuth() {
  nock("https://api.sensorpush.com")
    .post("/api/v1/oauth/authorize", {
      email: ACCEPTED_EMAIL,
      password: ACCEPTED_PASSWORD,
    })
    .reply(200, { authorization: AUTHORIZED_AUTHORIZATION_CODE }, [
      "Content-Type",
      "application/json",
    ]);

  nock("https://api.sensorpush.com")
    .post("/api/v1/oauth/accesstoken", {
      authorization: AUTHORIZED_AUTHORIZATION_CODE,
    })
    .reply(200, { accesstoken: AUTHORIZED_ACCESS_TOKEN }, ["Content-Type", "application/json"]);
}

function nockSensorList() {
  nock("https://api.sensorpush.com")
    .post("/api/v1/devices/sensors", { active: true })
    .reply(
      200,
      {
        DEVICE_ID: {
          calibration: { humidity: 0, temperature: 0 },
          address: "EE:25:3B:1C:8A:2D",
          name: "Living Room",
          active: true,
          deviceId: "123",
          alerts: {
            temperature: { enabled: false },
            humidity: { enabled: false },
          },
          id: DEVICE_ID,
          battery_voltage: 2.96,
        },
      },
      ["Content-Type", "application/json"]
    );
}

function nockSensorFetch() {
  nock("https://api.sensorpush.com")
    .post("/api/v1/samples", {
      startTime: "",
      limit: /\d+/,
      sensors: [DEVICE_ID],
    })
    .reply(
      200,
      {
        last_time: "2020-12-28T10:23:45.000Z",
        sensors: {
          [DEVICE_ID]: [
            {
              observed: "2020-12-28T10:23:45.000Z",
              temperature: 59.8,
              humidity: 46.6,
            },
            {
              observed: "2020-12-28T10:22:56.000Z",
              temperature: 59.9,
              humidity: 46.6,
            },
          ],
        },
        truncated: false,
        status: "OK",
        total_samples: 2,
        total_sensors: 1,
      },
      ["Content-Type", "application/json"]
    );
  nock("https://api.sensorpush.com")
    .post("/api/v1/samples", {
      startTime: "2020-12-28T10:23:46.000Z",
      limit: /\d+/,

      sensors: [DEVICE_ID],
    })
    .reply(
      200,
      {
        last_time: "1970-01-01T00:00:00.000Z",
        sensors: {},
        truncated: false,
        status: "OK",
        total_samples: 0,
        total_sensors: 0,
      },
      ["Content-Type", "application/json"]
    );
}

suite.test("Working auth", async () => {
  nockAuth();
  const authorizer = createAuthorizer(ACCEPTED_EMAIL, ACCEPTED_PASSWORD);
  const auth = await authorizer();
  assert.strictEqual(AUTHORIZED_ACCESS_TOKEN, auth);
});

function isMessage(data: unknown): data is { message: string } {
  return (data as { message: string }).message !== undefined;
}

suite.test("Wrong email", async () => {
  const badEmail = "not_real_user@example.com";
  nock("https://api.sensorpush.com")
    .post("/api/v1/oauth/authorize", {
      email: badEmail,
      password: ACCEPTED_PASSWORD,
    })
    .reply(403, { message: "invalid user" }, ["Content-Type", "application/json"]);
  const authorizer = createAuthorizer(badEmail, ACCEPTED_PASSWORD);
  try {
    await authorizer();
  } catch (error) {
    if (isResponseError(error)) {
      assert.strictEqual(error.response.statusCode, 403);
      if (isMessage(error.response.body)) {
        assert.strictEqual(error.response.body.message, "invalid user");
        return;
      }
    }
    throw error;
  }
  assert.fail("Expected request without start to raise a 403");
});

suite.test("Working backfill", async () => {
  nockSensorFetch();
  const mockAuthorizer = () => {
    return Promise.resolve(AUTHORIZED_ACCESS_TOKEN);
  };
  const results: (undefined | Date)[] = [undefined, new Date("2020-12-28T10:23:45.000Z")];
  function latestTime(): Promise<undefined | Date> {
    return Promise.resolve(results.shift());
  }
  const samples = [];
  for await (const item of backfiller(DEVICE_ID, mockAuthorizer, latestTime)) {
    samples.push(item);
  }
  assert.strictEqual(1, samples.length);
  assert.strictEqual(2, samples[0]?.samples.length);
});

suite.test("Full ingest", async () => {
  nockAuth();
  nockSensorList();
  nockSensorFetch();
  const samples: Samples[] = [];
  await ephemerally(async () => {
    for await (const sample of fetchLatest(createAuthorizer(ACCEPTED_EMAIL, ACCEPTED_PASSWORD))) {
      await insert(sample);
      samples.push(sample);
    }
  });

  assert.strictEqual(1, samples.length);
  assert.strictEqual(2, samples[0]?.samples.length);
});
