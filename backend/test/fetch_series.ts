import baretest from 'baretest';
import assert from 'assert';
import axios from 'axios';
const test = baretest('fetch_series');

test('Send in series', async () => {
    const resp = await axios.get('http://localhost:8000/series', {
        params: {
            start: "2020-10-01T00:00:00.000Z",
            end: "2020-10-01T00:30:00.000Z",
            device_name: "office",
            sensor: "celsius",
            aggregation: "max",
            points: 10
        }
    });
    console.log(resp.data);
});

import '../src/index';
test.run();