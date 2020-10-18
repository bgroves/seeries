import express from 'express';

import { pool } from './db';
import { requireInQuery, requireDateTimeInQuery, requireEnumInQuery, requireIntInQuery, ValidationError } from './validators';


interface PartialSegment {
    start: Date,
    end?: Date,
    points: number[]
}

interface Segment extends PartialSegment {
    end: Date
}

// Accepted values for the aggregation query param
enum Aggregation {
    MAX = 'MAX',
    MIN = 'MIN',
    AVG = 'AVG'
}

// Accepted values for the sensor query param if the device_name points to a sensorpush device
enum SensorPushSensors {
    celsius = 'celsius',
    relative_humidity = 'relative_humidity'
}

// Accepted values for the sensor query param if the device_name points to a tempest device
enum TempestSensors {
    wind_lull = 'wind_lull',
    wind_avg = 'wind_avg',
    wind_gust = 'wind_gust',
    wind_direction = 'wind_direction',
    wind_sample_interval = 'wind_sample_interval',
    pressure = 'pressure',
    celsius = 'celsius',
    relative_humidity = 'relative_humidity',
    illuminance = 'illuminance',
    uv = 'uv',
    solar_radiation = 'solar_radiation',
    rain_accumulation = 'rain_accumulation',
    precipitation_type = 'precipitation_type',
    average_strike_distance = 'average_strike_distance',
    strike_count = 'strike_count',
    battery = 'battery',
    report_interval = 'report_interval',
    local_day_rain_accumulation = 'local_day_rain_accumulation',
    rain_accumulation_final = 'rain_accumulation_final',
    local_day_rain_accumulation_final = 'local_day_rain_accumulation_final',
    precipitation_analysis_type = 'precipitation_analysis_type'
}

export async function fetchSeries(req: express.Request, res: express.Response): Promise<void> {
    const start = requireDateTimeInQuery(req, 'start');
    const end = requireDateTimeInQuery(req, 'end');
    const deviceName = requireInQuery(req, 'device_name');
    const aggregation = requireEnumInQuery(req, Aggregation, 'aggregation');
    const points = requireIntInQuery(req, 'points');

    if (points > 16_384) {
        throw new ValidationError("16k points ought to be enough for anybody");
    }

    const devices = await pool.query('SELECT id, type FROM device WHERE name = $1', [deviceName]);
    if (devices.rows.length === 0) {
        throw new ValidationError(`No device_name of '${deviceName}'`);
    }
    const device = devices.rows[0];

    const deviceSensors :object = device.type === 'sensorpush' ? SensorPushSensors : TempestSensors;
    const sensor :string = requireEnumInQuery(req, deviceSensors, 'sensor');

    const millis = end.getTime() - start.getTime();
    const millisPerPoint = millis / points;

    // Use pg_literal for types
    const results = await pool.query(`SELECT time_bucket_gapfill('${millisPerPoint} milliseconds', time) AS bucket, 
        ${aggregation}(${sensor}) AS value 
        FROM ${device.type} 
        WHERE time >= $1 AND time < $2 
        GROUP BY bucket 
        ORDER BY bucket ASC`, [start, end]);

    var currentSegment: PartialSegment | null = null;
    const segments: Segment[] = [];
    function handleSegmentEnd(end: Date) {
        if (currentSegment !== null) {
            currentSegment.end = end;
            segments.push(currentSegment as Segment);
            currentSegment = null;
        }
    }
    results.rows.forEach(element => {
        if (element.value === null) {
            handleSegmentEnd(element.bucket);
            return;
        }
        if (currentSegment === null) {
            currentSegment = { start: element.bucket, points: [] };
        }
        currentSegment.points.push(element.value);
    });
    handleSegmentEnd(end);
    res.send(segments);
}