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

enum Aggregation {
    MAX = 'MAX',
    MIN = 'MIN',
    AVG = 'AVG'
}

export async function fetchSeries(req: express.Request, res: express.Response): Promise<void> {
    const start = requireDateTimeInQuery(req, 'start');
    const end = requireDateTimeInQuery(req, 'end');
    const deviceName = requireInQuery(req, 'device_name');
    const sensor = requireInQuery(req, 'sensor');
    const aggregation = requireEnumInQuery(req, Aggregation, 'aggregation');
    const points = requireIntInQuery(req, 'points');

    if (points > 16_384) {
        throw new ValidationError("16k points ought to be enough for anybody");
    }

    const devices = await pool.query('SELECT id, type FROM device WHERE name = $1', [deviceName]);
    const device = devices.rows[0];

    const millis = end.getTime() - start.getTime();
    const millisPerPoint = millis / points;

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