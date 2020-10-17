import baretest from 'baretest';
import assert from 'assert';
import axios from 'axios';
const test = baretest('fetch_series');

test('Fetch simple series', async () => {
    const start = "2020-10-01T00:00:00.000Z";
    const end = "2020-10-01T00:30:00.000Z";
    const resp = await axios.get('http://localhost:8000/series', {
        params: {
            start: start,
            end: end,
            device_name: "office",
            sensor: "celsius",
            aggregation: "max",
            points: 10
        }
    });
    const segment = resp.data[0];
    assert.strictEqual(segment.start, start);
    assert.strictEqual(segment.end, end);
    assert.strictEqual(segment.points.length, 10);
});

test('Leave out params', async () => {
    const end = "2020-10-01T00:30:00.000Z";
    const params = {
        end: end,
        device_name: "office",
        sensor: "celsius",
        aggregation: "max",
        points: 10
    };
    try {
        await axios.get('http://localhost:8000/series', { params: params });
        assert.fail("Expected request without start to raise a 400")
    } catch (error: any) {
        assert.strictEqual(error.response.status, 400);
    }
});

import '../src/index';
test.run();