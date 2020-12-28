export type Aggregation = 'MIN' | 'MAX' | 'AVG';

export default class SeriesID {
  constructor(
    public device_name: string,
    public sensor: string,
    public aggregation: Aggregation
  ) {}

  hashKey(): string {
    return this.device_name + '_' + this.sensor + '_' + this.aggregation;
  }
}
