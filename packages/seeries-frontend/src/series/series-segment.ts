import { GraphScale } from '../graph/graph-scale';
import { GraphWindow, intersects } from '../graph/graph-window';
import MinMax from './min-max';
import SeriesPoint from './series-point';

export interface SeriesSegmentJSON {
  start: number | string | Date;
  end: number | string | Date;
  values: number[];
}

class SeriesSegment implements GraphWindow, GraphScale {
  private _minMax: MinMax;
  points: SeriesPoint[];
  start: Date;
  end: Date;

  constructor(start: Date, end: Date, minMax: MinMax, points: SeriesPoint[]) {
    this.start = start;
    this.end = end;
    this._minMax = minMax;
    this.points = points;
  }

  get min(): number {
    return this._minMax.min;
  }

  get max(): number {
    return this._minMax.max;
  }

  get empty(): boolean {
    return this.points.length === 0;
  }

  windowedBy(window: GraphWindow): SeriesSegment {
    const step =
      (this.end.getTime() - this.start.getTime()) / this.points.length;
    let startIndex = (window.start.getTime() - this.start.getTime()) / step;
    const maxEndIndex = (this.end.getTime() - this.start.getTime()) / step;
    let endIndex = (window.end.getTime() - window.start.getTime()) / step;

    if (startIndex < 0) {
      startIndex = 0;
    } else if (startIndex >= this.points.length) {
      return new SeriesSegment(window.start, window.end, new MinMax(), []);
    }

    if (endIndex > maxEndIndex) {
      endIndex = maxEndIndex;
    }
    if (endIndex > this.points.length) {
      endIndex = this.points.length;
    } else if (endIndex <= 0) {
      return new SeriesSegment(window.start, window.end, new MinMax(), []);
    }

    // If it's the entire segment no need to make a new copy
    if (startIndex === 0 && endIndex === this.points.length) {
      return this;
    }

    const pointsSlice = this.points.slice(startIndex, endIndex);

    return new SeriesSegment(
      pointsSlice[0].time,
      pointsSlice[pointsSlice.length - 1].time,
      pointsSlice.reduce((acc, input) => {
        return acc.update(input.value);
      }, new MinMax()),
      pointsSlice
    );
  }

  isInWindow(window: GraphWindow): boolean {
    return intersects(this, window);
  }

  static create(props: SeriesSegmentJSON): SeriesSegment {
    const start = new Date(props.start);
    const end = new Date(props.end);
    const points = [];
    const step = (end.getTime() - start.getTime()) / props.values.length;
    const minMax = new MinMax();

    let time = start;
    for (let i = 0; i < props.values.length; i++) {
      const current = props.values[i];
      points.push(new SeriesPoint(time, current));
      time = new Date(time.getTime() + step);
      minMax.update(current);
    }

    return new SeriesSegment(start, end, minMax, points);
  }

  static fromJSON(input: SeriesSegmentJSON | string): SeriesSegment {
    if (typeof input === 'string') {
      return JSON.parse(input, SeriesSegment.reviver);
    } else {
      return SeriesSegment.create(input);
    }
  }

  static reviver(key: string, value: any): any {
    return key === '' ? SeriesSegment.fromJSON(value) : value;
  }
}

export default SeriesSegment;
