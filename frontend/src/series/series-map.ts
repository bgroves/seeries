import Series from './series';
import SeriesID from './series-id';

export default class SeriesMap {
  private map: { [key: string]: Promise<Series> };

  constructor() {
    this.map = {};
  }

  get(key: SeriesID): Promise<Series> | undefined {
    return this.map[key.hashKey()];
  }

  put(key: SeriesID, value: Promise<Series>): SeriesMap {
    this.map[key.hashKey()] = value;
    return this;
  }
}
