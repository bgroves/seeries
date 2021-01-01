import assert from "assert";
import { insert } from "../src/db";
import { pool } from "../../shared/src/db";
import { Caretest } from "../../shared/src/caretest";
import { PoolClient } from "pg";

const suite = new Caretest("db");
export default suite;

async function withClient<T>(op: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    return await op(client);
  } finally {
    client.release();
  }
}
const singleSample = {
  id: "hi",
  samples: [{ observed: new Date().toISOString(), temperature: 53, humidity: 55 }],
};

function isError(e: unknown): e is Error {
  return (e as Error).message !== undefined;
}

async function ephemerally<T>(op: (client: PoolClient) => Promise<T>): Promise<T> {
  return await withClient(async (client) => {
    await client.query("BEGIN");
    // We don't try/catch this as an exception being thrown releases this client without
    // committing the transaction. That's effectively a rollback.
    const t = await op(client);
    await client.query("ROLLBACK");
    return t;
  });
}
suite.test("Insert 1", async () => {
  await ephemerally(async (client) => {
    const deviceId = await insert(singleSample, client);
    const result = await client.query(
      "SELECT time, device_id, celsius, relative_humidity FROM sensorpush WHERE device_id = $1;",
      [deviceId]
    );
    assert.deepStrictEqual(result.rows.length, 1);
  });
});
suite.test("Inserting the same sample twice fails", async () => {
  await ephemerally(async (client) => {
    await insert(singleSample, client);
    try {
      await insert(singleSample, client);
    } catch (error) {
      if (isError(error)) {
        assert.ok(error.message.indexOf("duplicate key value violates unique constraint") != -1);
        return;
      }
      throw error;
    }
    assert.fail("Expected second sample for same time and id to violate a unique constraint");
  });
});
