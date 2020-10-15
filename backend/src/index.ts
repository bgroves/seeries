import express from 'express';
import * as db from '../zapatos/src';
import * as s from '../zapatos/schema';
import pg from 'pg';

const pool = new pg.Pool({
    "user": "seeries",
    "host": "localhost",
    "password": "RcJhCBt2CE2dz7#B"
});
const app = express();
const PORT = 8000;
app.get('/', async (req, res) => {
    const celsius = await db.sql<s.celsius.SQL, s.celsius.Selectable[]>`SELECT time, celsius FROM celsius WHERE device_id = 5 LIMIT 10`.run(pool);
    res.send(celsius);
});
app.listen(PORT, () => {
    console.log(`🐇[series]: Server is hopping at https://localhost:${PORT}`);
});