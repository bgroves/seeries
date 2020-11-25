import { GraphScale } from '../graph/graph-scale';
import GraphWindow, { intersects } from '../graph/graph-window';
import MinMax from './min-max';
import GraphPoint from '../graph/graph-point';
import { checkDatelikeProperty } from '../validation';

export class ValidationError extends Error {}

export interface SeriesSegmentJSON {
  start: number | string | Date;
  end: number | string | Date;
  points: number[];
}

function isSeriesSegmentJSON(input: any): input is SeriesSegmentJSON {
  if (input == null) {
    throw new ValidationError('Can not be null.');
  }

  checkDatelikeProperty(input, 'start');
  checkDatelikeProperty(input, 'end');

  if (!Array.isArray(input.points) || (input.points as Array<any>).length < 1) {
    throw new ValidationError(
      `Property "points" must be a non-empty array of numbers but received "${input.points}".`
    );
  }

  return true;
}

class SeriesSegment implements GraphWindow, GraphScale {
  private _minMax: MinMax;
  pointScale: number;

  constructor(
    public start: Date,
    public end: Date,
    public points: GraphPoint[],
    pointScale: number,
    minMax?: MinMax
  ) {
    this.pointScale = pointScale;
    this._minMax = minMax == null ? new MinMax() : minMax;
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
      return new SeriesSegment(window.start, window.end, [], this.pointScale);
    }

    if (endIndex > maxEndIndex) {
      endIndex = maxEndIndex;
    }
    if (endIndex > this.points.length) {
      endIndex = this.points.length;
    } else if (endIndex <= 0) {
      return new SeriesSegment(window.start, window.end, [], this.pointScale);
    }

    // If it's the entire segment no need to make a new copy
    if (startIndex === 0 && endIndex === this.points.length) {
      return this;
    }

    const pointsSlice = this.points.slice(startIndex, endIndex);

    return new SeriesSegment(
      pointsSlice[0].time,
      pointsSlice[pointsSlice.length - 1].time,
      pointsSlice,
      this.pointScale,
      pointsSlice.reduce((acc, input) => {
        return acc.update(input.value);
      }, new MinMax())
    );
  }

  isInWindow(window: GraphWindow): boolean {
    return intersects(this, window);
  }

  static create(props: SeriesSegmentJSON, pointScale: number): SeriesSegment {
    const start = new Date(props.start);
    const end = new Date(props.end);
    const points = [];
    const step = (end.getTime() - start.getTime()) / props.points.length;
    const minMax = new MinMax();

    let time = start;
    for (let i = 0; i < props.points.length; i++) {
      const current = props.points[i];
      points.push(new GraphPoint(time, current));
      time = new Date(time.getTime() + step);
      minMax.update(current);
    }

    return new SeriesSegment(start, end, points, pointScale, minMax);
  }

  static fromJSON(input: any, pointScale: number): SeriesSegment {
    if (isSeriesSegmentJSON(input)) {
      return SeriesSegment.create(input, pointScale);
    }
    throw new ValidationError('Invalid JSON input.');
  }
}

export default SeriesSegment;
