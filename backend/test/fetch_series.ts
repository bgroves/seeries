import baretest from 'baretest';
import assert from 'assert';
import axios from 'axios';
const test = baretest('fetch_series');

const baseStart = "2020-10-01T00:00:00.000Z";
const baseEnd = "2020-10-01T00:30:00.000Z";
const baseParams = {
    start: baseStart,
    end: baseEnd,
    device_name: "office",
    sensor: "celsius",
    aggregation: "MAX",
    points: 10
};

test('Fetch simple series', async () => {
    const resp = await axios.get('http://localhost:8000/series', { params: baseParams });
    const segment = resp.data[0];
    assert.strictEqual(segment.start, baseParams.start);
    assert.strictEqual(segment.end, baseParams.end);
    assert.strictEqual(segment.points.length, baseParams.points);
});

test('Leave out params', async () => {
    const params: { [key: string]: any } = { ...baseParams };
    delete params['start'];
    try {
        await axios.get('http://localhost:8000/series', { params: params });
    } catch (error: any) {
        assert.strictEqual(error.response.status, 400);
        assert.ok((error.response.data as string).indexOf("start") != -1);
        return;
    }
    assert.fail("Expected request without start to raise a 400")
});

test('Too many points', async () => {
    const params = { ...baseParams };
    params.points = 17_000
    try {
        await axios.get('http://localhost:8000/series', { params: params });
    } catch (error: any) {
        assert.strictEqual(error.response.status, 400);
        return;
    }
    assert.fail("Expected request with lots of points to raise a 400");
});

test('Unknown aggregation', async () => {
    const params = { ...baseParams };
    params.aggregation = "; DROP TABLES;";
    try {
        await axios.get('http://localhost:8000/series', { params: params });
    } catch (error: any) {
        assert.strictEqual(error.response.status, 400);
        assert.ok((error.response.data as string).indexOf("AVG") != -1);
        return;
    }
    assert.fail("Expected request with lots of points to raise a 400");
});

test('Unknown device', async () => {
    const params = { ...baseParams };
    params.device_name = "; DROP TABLES;";
    try {
        await axios.get('http://localhost:8000/series', { params: params });
    } catch (error: any) {
        assert.strictEqual(error.response.status, 400);
        assert.ok((error.response.data as string).indexOf("DROP TABLES") != -1);
        return;
    }
    assert.fail("Expected request with lots of points to raise a 400");
});

test('Wrong sensor for device type', async () => {
    const params = { ...baseParams };
    params.sensor = "; DROP TABLES;";
    try {
        await axios.get('http://localhost:8000/series', { params: params });
    } catch (error: any) {
        assert.strictEqual(error.response.status, 400);
        assert.ok((error.response.data as string).indexOf("DROP TABLES") != -1);
        return;
    }
    assert.fail("Expected request for a sensorpush device with a tempest-only sensor to raise a 400");
});

import '../src/index';
test.run();