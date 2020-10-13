export interface SeriesPointProps {
  time: number | string | Date;
  value: number;
}

export default class SeriesPoint {
  time: Date;
  value: number;

  constructor(time: Date, value: number) {
    this.time = time;
    this.value = value;
  }

  toString(): string {
    return '(' + this.time.toISOString() + ', ' + this.value + ')';
  }

  static fromJSON(json: SeriesPointProps | string): SeriesPoint {
    if (typeof json === 'string') {
      return JSON.parse(json, SeriesPoint.reviver);
    } else {
      const result = Object.create(SeriesPoint.prototype);

      return Object.assign(result, json, {
        time: new Date(json.time),
      });
    }
  }

  static reviver(key: string, value: any): any {
    return key === '' ? SeriesPoint.fromJSON(value) : value;
  }
}
