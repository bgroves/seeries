import { Caretest } from "../../shared/src/caretest";
import assert from "assert";
export const suite = new Caretest("handlers");

import { server } from "../src/index";
import got, { HTTPError } from "got";
const baseStart = "2020-10-01T00:00:00.000Z";
const baseEnd = "2020-10-01T00:30:00.000Z";
const baseParams = {
  start: baseStart,
  end: baseEnd,
  device_name: "office",
  sensor: "celsius",
  aggregation: "MAX",
  points: 10,
};

interface Segment {
  start: Date;
  end: Date;
  points: number[];
}

const client = got.extend({ prefixUrl: "http://localhost:8000", responseType: "json" });

export function isResponseError(error: unknown): error is HTTPError {
  return (error as HTTPError).response !== undefined;
}

suite.test("Fetch simple series", async () => {
  const resp = await client<Segment[]>("series", {
    searchParams: baseParams,
  });
  assert.strictEqual(resp.body.length, 1);
  const segment = resp.body[0];
  assert.strictEqual(segment.start, baseParams.start);
  assert.strictEqual(segment.end, baseParams.end);
  assert.strictEqual(segment.points.length, baseParams.points);
});

suite.test("Fetch completely missing range", async () => {
  const params = { ...baseParams };
  params.start = "2020-10-03T00:00:00.000Z";
  params.end = "2020-10-03T00:10:00.000Z";
  const resp = await client<Segment[]>("series", {
    searchParams: params,
  });
  assert.strictEqual(resp.body.length, 0);
});

suite.test("Fetch same start and end", async () => {
  const params = { ...baseParams };
  params.end = params.start;
  const resp = await client<Segment[]>("series", {
    searchParams: params,
  });
  assert.strictEqual(resp.body.length, 0);
});

suite.test("Fetch half missing range", async () => {
  const params = { ...baseParams };
  params.start = "2020-10-03T00:00:00.000Z";
  params.end = "2020-10-03T00:20:00.000Z";
  const resp = await client<Segment[]>("series", {
    searchParams: params,
  });
  assert.strictEqual(resp.body.length, 1);
  const segment = resp.body[0];
  assert.strictEqual(segment.start, "2020-10-03T00:10:00.000Z");
  assert.strictEqual(segment.end, params.end);
  assert.strictEqual(segment.points.length, 5);
});

suite.test("Fetch gappy range", async () => {
  const params = { ...baseParams };
  params.start = "2020-10-03T01:00:00.000Z";
  params.end = "2020-10-03T01:10:00.000Z";
  const resp = await client<Segment[]>("series", {
    searchParams: params,
  });
  assert.strictEqual(resp.body.length, 5);
  const firstSegment = resp.body[0];
  assert.strictEqual(firstSegment.start, "2020-10-03T01:01:00.000Z");
  assert.strictEqual(firstSegment.end, "2020-10-03T01:02:00.000Z");
  assert.strictEqual(firstSegment.points.length, 1);
  const lastSegment = resp.body[resp.body.length - 1];
  assert.strictEqual(lastSegment.start, "2020-10-03T01:09:00.000Z");
  assert.strictEqual(lastSegment.end, params.end);
  assert.strictEqual(lastSegment.points.length, 1);
});

suite.test("Fetch gappy range at low resolution", async () => {
  const params = { ...baseParams };
  params.start = "2020-10-03T01:00:00.000Z";
  params.end = "2020-10-03T02:00:00.000Z";
  const resp = await client<Segment[]>("series", {
    searchParams: params,
  });
  assert.strictEqual(resp.body.length, 1);
  const firstSegment = resp.body[0];
  assert.strictEqual(firstSegment.start, params.start);
  assert.strictEqual(firstSegment.end, params.end);
  assert.strictEqual(firstSegment.points.length, 10);
});

suite.test("Fetch small range at excessively high resolution", async () => {
  const params = { ...baseParams };
  params.points = 16_384;
  const resp = await client<Segment[]>("series", {
    searchParams: params,
  });
  assert.strictEqual(resp.body.length, 30);
  assert.strictEqual(params.start, resp.body[0].start);
});

suite.test("Fetch large series", async () => {
  const params = { ...baseParams };
  params.points = 16_384;
  params.start = "2020-09-01T00:00:00.000Z";
  params.end = "2020-10-01T00:00:00.000Z";
  const resp = await client<Segment[]>("series", {
    searchParams: params,
  });
  const segment = resp.body[0];
  assert.strictEqual(segment.start, params.start);
  assert.strictEqual(segment.end, params.end);
  assert.strictEqual(segment.points.length, params.points);
});

suite.test("Leave out params", async () => {
  const searchParams: { [key: string]: string | number } = { ...baseParams };
  delete searchParams["start"];
  try {
    await client("series", { searchParams });
  } catch (error) {
    if (isResponseError(error)) {
      assert.strictEqual(error.response.statusCode, 400);
      assert.ok((error.response.body as string).indexOf("start") != -1);
      return;
    }
    throw error;
  }
  assert.fail("Expected request without start to raise a 400");
});

suite.test("Too many points", async () => {
  const searchParams = { ...baseParams };
  searchParams.points = 17_000;
  try {
    await client("series", { searchParams });
  } catch (error) {
    if (isResponseError(error)) {
      assert.strictEqual(error.response.statusCode, 400);
      return;
    }
    throw error;
  }
  assert.fail("Expected request with lots of points to raise a 400");
});

suite.test("Unknown aggregation", async () => {
  const searchParams = { ...baseParams };
  searchParams.aggregation = "; DROP TABLES;";
  try {
    await client("series", { searchParams });
  } catch (error) {
    if (isResponseError(error)) {
      assert.strictEqual(error.response.statusCode, 400);
      assert.ok((error.response.body as string).indexOf("AVG") != -1);
      return;
    }
    throw error;
  }
  assert.fail("Expected unknown aggregation to raise a 400");
});

suite.test("Unknown device", async () => {
  const searchParams = { ...baseParams };
  searchParams.device_name = "; DROP TABLES;";
  try {
    await client("series", { searchParams });
  } catch (error) {
    if (isResponseError(error)) {
      assert.strictEqual(error.response.statusCode, 400);
      assert.ok((error.response.body as string).indexOf("DROP TABLES") != -1);
      return;
    }
    throw error;
  }
  assert.fail("Expected unknown device_name to raise a 400");
});

suite.test("Wrong sensor for device type", async () => {
  const searchParams = { ...baseParams };
  searchParams.sensor = "; DROP TABLES;";
  try {
    await client("series", { searchParams });
  } catch (error) {
    if (isResponseError(error)) {
      assert.strictEqual(error.response.statusCode, 400);
      assert.ok((error.response.body as string).indexOf("DROP TABLES") != -1);
      return;
    }
    throw error;
  }
  assert.fail("Expected request for a sensorpush device with a tempest-only sensor to raise a 400");
});

suite.test("End before start", async () => {
  const searchParams = { ...baseParams };
  searchParams.end = baseParams.start;
  searchParams.start = baseParams.end;
  try {
    await client("series", { searchParams });
  } catch (error) {
    if (isResponseError(error)) {
      assert.strictEqual(error.response.statusCode, 400);
      assert.ok((error.response.body as string).indexOf("is after end") != -1);
      return;
    }
    throw error;
  }
  assert.fail("Expected request for a sensorpush device with a tempest-only sensor to raise a 400");
});

suite.after(() => {
  server.close();
});
