export interface GraphPointProps {
  time: number | string | Date;
  value: number;
}

export function sortGraphPointByTime(a: GraphPoint, b: GraphPoint): number {
  return a.time.getTime() - b.time.getTime();
}

export default class GraphPoint {
  time: Date;
  value: number;

  constructor(time: Date, value: number) {
    this.time = time;
    this.value = value;
  }

  toString(): string {
    return '(' + this.time.toISOString() + ', ' + this.value + ')';
  }

  static fromJSON(json: GraphPointProps | string): GraphPoint {
    if (typeof json === 'string') {
      return JSON.parse(json, GraphPoint.reviver);
    } else {
      const result = Object.create(GraphPoint.prototype);

      return Object.assign(result, json, {
        time: new Date(json.time),
      });
    }
  }

  static reviver(key: string, value: any): any {
    return key === '' ? GraphPoint.fromJSON(value) : value;
  }
}
