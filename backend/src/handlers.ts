import express from 'express';

import { pool } from './db';
import { requireInQuery, requireDateTimeInQuery, requireIntInQuery } from './validators';

class SegmentBuilder {
    constructor(public start: Date, public points: number[] = []) { }

    build(end: Date): Segment {
        return {...this, end};
    }
}

interface Segment {
    start: Date,
    end: Date,
    points: number[]
}

export async function fetchSeries(req: express.Request, res: express.Response): Promise<void> {
    const start = requireDateTimeInQuery(req, 'start');
    const end = requireDateTimeInQuery(req, 'end');
    const deviceName = requireInQuery(req, 'device_name');
    const sensor = requireInQuery(req, 'sensor');
    const aggregation = requireInQuery(req, 'aggregation');
    const points = requireIntInQuery(req, 'points');

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

    var currentSegment: SegmentBuilder | null = null;
    const segments: Segment[] = [];
    function handleSegmentEnd(end: Date) {
        if (currentSegment !== null) {
            segments.push(currentSegment.build(end));
            currentSegment = null;
        }
    }
    results.rows.forEach(element => {
        if (element.value === null) {
            handleSegmentEnd(element.bucket);
            return;
        }
        if (currentSegment === null) {
            currentSegment = new SegmentBuilder(element.bucket);
        }
        currentSegment.points.push(element.value);
    });
    handleSegmentEnd(end);
    res.send(segments);
}