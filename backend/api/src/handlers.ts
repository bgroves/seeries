import express from "express";
import format from "pg-format";
import { pool } from "../../shared/src/db";
import {
  requireInQuery,
  requireDateTimeInQuery,
  requireIntInQuery,
  requireSetMemberInQuery,
  ValidationError,
} from "./validators";

interface PartialSegment {
  start: Date;
  end?: Date;
  points: number[];
}

interface Segment extends PartialSegment {
  end: Date;
}

// Accepted values for the aggregation query param
const AGGREGATION = new Set(["MAX", "MIN", "AVG"]);

// Accepted values for the sensor query param if the device_name points to a sensorpush device
const SENSOR_PUSH_SENSORS = new Set(["celsius", "relative_humidity"]);

// Accepted values for the sensor query param if the device_name points to a tempest device
const TEMPEST_SENSORS = new Set([
  "wind_lull",
  "wind_avg",
  "wind_gust",
  "wind_direction",
  "wind_sample_interval",
  "pressure",
  "celsius",
  "relative_humidity",
  "illuminance",
  "uv",
  "solar_radiation",
  "rain_accumulation",
  "precipitation_type",
  "average_strike_distance",
  "strike_count",
  "battery",
  "report_interval",
  "local_day_rain_accumulation",
  "rain_accumulation_final",
  "local_day_rain_accumulation_final",
  "precipitation_analysis_type",
]);

interface IdTypeRow {
  id: string;
  type: string;
}
interface BucketValueRow {
  bucket: Date;
  value: number;
}

export async function fetchSeries(req: express.Request, res: express.Response): Promise<void> {
  const start = requireDateTimeInQuery(req, "start");
  const end = requireDateTimeInQuery(req, "end");
  const deviceName = requireInQuery(req, "device_name");
  const aggregation = requireSetMemberInQuery(req, "aggregation", AGGREGATION);
  const points = requireIntInQuery(req, "points");

  if (start.getTime() > end.getTime()) {
    throw new ValidationError(`start of ${start.toString()} is after end at ${end.toString()}`);
  }

  if (points > 16_384) {
    throw new ValidationError("16k points ought to be enough for anybody");
  }

  const devices = await pool().query<IdTypeRow>("SELECT id, type FROM device WHERE name = $1", [
    deviceName,
  ]);
  if (devices.rows.length === 0) {
    throw new ValidationError(`No device_name of '${deviceName}'`);
  }
  const device = devices.rows[0];

  const deviceSensors = device.type === "sensorpush" ? SENSOR_PUSH_SENSORS : TEMPEST_SENSORS;
  const sensor: string = requireSetMemberInQuery(req, "sensor", deviceSensors);

  const millis = end.getTime() - start.getTime();
  const millisPerPoint = millis / points;

  // Select bucketed by the number of milliseconds between points necessary to fill this time interval.
  // Pass in the start as an origin to time_bucket as we want to align the buckets on the start time.
  const query = format(
    `SELECT time_bucket(%L, time, timestamp with time zone %L) AS bucket,
        %s(%I) AS value
        FROM %I
        WHERE time >= $1 AND time < $2 AND device_id = $3
        GROUP BY bucket
        ORDER BY bucket ASC`,
    `${millisPerPoint} milliseconds`,
    start,
    aggregation,
    sensor,
    device.type
  );
  const results = await pool().query<BucketValueRow>(query, [start, end, device.id]);

  let currentSegment: PartialSegment | null = null;
  const segments: Segment[] = [];
  function handleSegmentEnd(end: Date) {
    if (currentSegment !== null) {
      currentSegment.end = end;
      segments.push(currentSegment as Segment);
      currentSegment = null;
    }
  }
  results.rows.forEach((element, idx) => {
    if (currentSegment !== null) {
      const previousPointBucket = results.rows[idx - 1].bucket.getTime();
      if (element.bucket.getTime() - previousPointBucket >= millisPerPoint + 1) {
        handleSegmentEnd(new Date(previousPointBucket + millisPerPoint));
      }
    }
    if (currentSegment === null) {
      currentSegment = { start: element.bucket, points: [] };
    }
    currentSegment.points.push(element.value);
  });
  if (currentSegment !== null) {
    const finalBucket = results.rows[results.rows.length - 1].bucket;
    if (Math.abs(finalBucket.getTime() - end.getTime()) === Math.ceil(millisPerPoint)) {
      handleSegmentEnd(end);
    } else {
      handleSegmentEnd(new Date(finalBucket.getTime() + millisPerPoint));
    }
  }
  res.send(segments);
}
