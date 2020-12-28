import axios from 'axios';
import queryString from 'querystring';
import config from '../config';
import GraphWindow from '../graph/graph-window';
import { checkIsArray } from '../validation';
import Series from './series';
import SeriesID from './series-id';
import SeriesMap from './series-map';
import SeriesSegment from './series-segment';

let api = axios.create({
  baseURL: config.apiUrl,
  timeout: parseInt(config.apiTimeout),
});

function toQueryString(window: GraphWindow, id: SeriesID): string {
  return queryString.stringify({
    start: window.start.toISOString(),
    end: window.end.toISOString(),
    points: window.pointScale,
    device_name: id.device_name,
    aggregation: id.aggregation,
    sensor: id.sensor,
  });
}

export async function fetchSeries(
  window: GraphWindow,
  id: SeriesID
): Promise<Series> {
  try {
    const response = await api.get('/series?' + toQueryString(window, id));
    const data = checkIsArray<any>(response.data);
    return new Series(id, window.pointScale, data.map(SeriesSegment.fromJSON));
  } catch (error) {
    console.log(error);
    return error;
  }
}

export function fetchAllSeries(
  window: GraphWindow,
  ids: SeriesID[]
): SeriesMap {
  const map = new SeriesMap();
  for (const id of ids) {
    const currentFetch = fetchSeries(window, id);
    map.put(id, currentFetch);
  }

  return map;
}
