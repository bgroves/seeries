import baretest from "baretest";
import assert from "assert";
import nock from "nock";

import { createAuthorizer, backfiller, ingest } from "../src/ingester";
import { AxiosError } from "axios";

const test = baretest("ingester");

const ACCEPTED_EMAIL = "real_user@example.com";
const ACCEPTED_PASSWORD = "correct_password";
const AUTHORIZED_AUTHORIZATION_CODE = "iamnotarealauthorizationcode";
const AUTHORIZED_ACCESS_TOKEN = "iamnotarealaccesstoken";
const DEVICE_ID = "207835.2051813140491938769";

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
    .reply(200, { accesstoken: AUTHORIZED_ACCESS_TOKEN }, [
      "Content-Type",
      "application/json",
    ]);
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
          deviceId: "207835",
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

test("Working auth", async () => {
  nockAuth();
  const authorizer = createAuthorizer(ACCEPTED_EMAIL, ACCEPTED_PASSWORD);
  const auth = await authorizer();
  assert.strictEqual(AUTHORIZED_ACCESS_TOKEN, auth);
});

function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined;
}

function isMessage(data: unknown): data is { message: string } {
  return (data as { message: string }).message !== undefined;
}

test("Wrong email", async () => {
  const badEmail = "not_real_user@example.com";
  nock("https://api.sensorpush.com")
    .post("/api/v1/oauth/authorize", {
      email: badEmail,
      password: ACCEPTED_PASSWORD,
    })
    .reply(403, { message: "invalid user" }, [
      "Content-Type",
      "application/json",
    ]);
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
  assert.fail("Expected request without start to raise a 403");
});

test("Working backfill", async () => {
  nockSensorFetch();
  const mockAuthorizer = () => {
    return Promise.resolve(AUTHORIZED_ACCESS_TOKEN);
  };
  const samples = [];
  for await (const item of backfiller(DEVICE_ID, mockAuthorizer)) {
    samples.push(item);
  }
  assert.strictEqual(1, samples.length);
  assert.strictEqual(2, samples[0]?.samples.length);
});

test("Full ingest", async () => {
  nockAuth();
  nockSensorList();
  nockSensorFetch();
  const samples = [];
  for await (const item of ingest(ACCEPTED_EMAIL, ACCEPTED_PASSWORD)) {
    samples.push(item);
  }
  assert.strictEqual(1, samples.length);
  assert.strictEqual(2, samples[0]?.samples.length);
});

void test.run();
