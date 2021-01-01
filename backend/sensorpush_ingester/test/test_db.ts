import assert from "assert";
import { insert } from "../src/db";
import { Caretest } from "../../shared/src/caretest";
import { ephemerally, pool } from "../../shared/src/db";

const suite = new Caretest("db");
export default suite;

const singleSample = {
  id: "hi",
  samples: [{ observed: new Date().toISOString(), temperature: 53, humidity: 55 }],
};

function isError(e: unknown): e is Error {
  return (e as Error).message !== undefined;
}
suite.test("Insert 1", async () => {
  await ephemerally(
    async () => {
      const deviceId = await insert(singleSample);
      const result = await pool().query<{   time: Date}>(
        "SELECT time FROM sensorpush WHERE device_id = $1;",
        [deviceId]
      );
      assert.deepStrictEqual(result.rows.length, 1);
    }
  );
});
suite.test("Inserting the same sample twice fails", async () => {
  await ephemerally(async () => {
    await insert(singleSample);
    try {
      await insert(singleSample);
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
