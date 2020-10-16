import express from 'express';

import { pool } from './db';
import { requireInQuery, requireDateTimeInQuery, requireIntInQuery } from './validators';

export async function fetchSeries(req: express.Request, res: express.Response): Promise<void> {
    const start = requireDateTimeInQuery(req, 'start');
    const end = requireDateTimeInQuery(req, 'end');
    const deviceName = requireInQuery(req, 'device_name');
    const sensor = requireInQuery(req, 'sensor');
    const aggregation = requireInQuery(req, 'aggregation');
    const points = requireIntInQuery(req, 'points');
    const devices = await pool.query('SELECT id, type FROM device WHERE name = $1', [deviceName]);
    const device = devices.rows[0];
    const results = await pool.query(`SELECT time_bucket('1 hour', time) AS hour, ${aggregation}(${sensor}) FROM ${device.type} WHERE time >= $1 AND time < $2 GROUP BY hour ORDER BY hour DESC`, [start, end]);
    res.send(results.rows);
}