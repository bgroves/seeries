import { assert } from "console";
import { pool } from "../../shared/src/db";
import { Samples } from "./ingester";
import format from "pg-format";

interface IdTypeRow {
  id: number;
  type: string;
}

export async function latestTime(id: string): Promise<Date | undefined> {
  const devices = await pool().query<IdTypeRow>(`SELECT id, type FROM device WHERE name = $1`, [
    id,
  ]);
  if (devices.rows.length === 0) {
    return undefined;
  }
  const deviceId = devices.rows[0].id;
  const time = await pool().query<{ time: Date }>(
    `SELECT time FROM sensorpush WHERE device_id = $1 ORDER BY time DESC LIMIT 1`,
    [deviceId]
  );
  if (time.rows.length === 0) {
    return undefined;
  }
  return time.rows[0].time;
}

export async function insert(samples: Samples): Promise<number> {
  let devices = await pool().query<IdTypeRow>(`SELECT id, type FROM device WHERE name = $1`, [
    samples.id,
  ]);
  if (devices.rows.length === 0) {
    devices = await pool().query<IdTypeRow>(
      `INSERT INTO device (type, name) VALUES ('sensorpush', $1) RETURNING id, type`,
      [samples.id]
    );
  } else {
    assert(
      devices.rows[0].type === "sensorpush",
      `Already a non sensorpush device '${devices.rows[0].type}' for name '${samples.id}'`
    );
  }
  const deviceId = devices.rows[0].id;
  const toInsert = samples.samples.map((sample) => {
    return [sample.observed, deviceId, sample.temperature, sample.humidity];
  });
  const insert = format(
    `INSERT INTO sensorpush (time, device_id, celsius, relative_humidity) VALUES %L`,
    toInsert
  );
  const inserted = await pool().query(insert);
  assert(inserted.rowCount == samples.samples.length);
  return deviceId;
}
