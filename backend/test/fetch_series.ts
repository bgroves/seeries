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
    assert.strictEqual(resp.data.length, 1);
    const segment = resp.data[0];
    assert.strictEqual(segment.start, baseParams.start);
    assert.strictEqual(segment.end, baseParams.end);
    assert.strictEqual(segment.points.length, baseParams.points);
});

test('Fetch completely missing range', async () => {
    const params = { ...baseParams };
    params.start = "2020-10-03T00:00:00.000Z";
    params.end = "2020-10-03T00:10:00.000Z";
    const resp = await axios.get('http://localhost:8000/series', { params: params });
    assert.strictEqual(resp.data.length, 0);
});

test('Fetch same start and end', async () => {
    const params = { ...baseParams };
    params.end = params.start
    const resp = await axios.get('http://localhost:8000/series', { params: params });
    assert.strictEqual(resp.data.length, 0);
});

test('Fetch half missing range', async () => {
    const params = { ...baseParams };
    params.start = "2020-10-03T00:00:00.000Z";
    params.end = "2020-10-03T00:20:00.000Z";
    const resp = await axios.get('http://localhost:8000/series', { params: params });
    assert.strictEqual(resp.data.length, 1);
    const segment = resp.data[0];
    assert.strictEqual(segment.start, "2020-10-03T00:10:00.000Z");
    assert.strictEqual(segment.end, params.end);
    assert.strictEqual(segment.points.length, 5);
});

test('Fetch gappy range', async () => {
    const params = { ...baseParams };
    params.start = "2020-10-03T01:00:00.000Z";
    params.end = "2020-10-03T01:10:00.000Z";
    const resp = await axios.get('http://localhost:8000/series', { params: params });
    assert.strictEqual(resp.data.length, 5);
    const firstSegment = resp.data[0];
    assert.strictEqual(firstSegment.start, "2020-10-03T01:01:00.000Z");
    assert.strictEqual(firstSegment.end, "2020-10-03T01:02:00.000Z");
    assert.strictEqual(firstSegment.points.length, 1);
    const lastSegment = resp.data[resp.data.length - 1];
    assert.strictEqual(lastSegment.start, "2020-10-03T01:09:00.000Z");
    assert.strictEqual(lastSegment.end, params.end);
    assert.strictEqual(lastSegment.points.length, 1);
});

test('Fetch gappy range at low resolution', async () => {
    const params = { ...baseParams };
    params.start = "2020-10-03T01:00:00.000Z";
    params.end = "2020-10-03T02:00:00.000Z";
    const resp = await axios.get('http://localhost:8000/series', { params: params });
    assert.strictEqual(resp.data.length, 1);
    const firstSegment = resp.data[0];
    assert.strictEqual(firstSegment.start, params.start);
    assert.strictEqual(firstSegment.end, params.end);
    assert.strictEqual(firstSegment.points.length, 10);
});

test('Fetch small range at excessively high resolution', async () => {
    const params = { ...baseParams };
    params.points = 16_384;
    const resp = await axios.get('http://localhost:8000/series', { params: params });
    assert.strictEqual(resp.data.length, 30);
    assert.strictEqual(params.start, resp.data[0].start);
});

test('Fetch large series', async () => {
    const params = { ...baseParams };
    params.points = 16_384;
    params.start = "2020-09-01T00:00:00.000Z";
    params.end = "2020-10-01T00:00:00.000Z";
    const resp = await axios.get('http://localhost:8000/series', { params: params });
    const segment = resp.data[0];
    assert.strictEqual(segment.start, params.start);
    assert.strictEqual(segment.end, params.end);
    assert.strictEqual(segment.points.length, params.points);
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
    assert.fail("Expected unknown aggregation to raise a 400");
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
    assert.fail("Expected unknown device_name to raise a 400");
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