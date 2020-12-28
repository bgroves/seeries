import { GraphScale } from '../graph/graph-scale';
import GraphWindow, { intersects } from '../graph/graph-window';
import MinMax from '../series/min-max';
import GraphPoint, { sortGraphPointByTime } from './graph-point';
import SeriesSegment from '../series/series-segment';
import Series from '../series/series';

class GraphChunk implements GraphWindow, GraphScale {
  private scale: MinMax;
  pointScale: number;

  constructor(
    public start: Date,
    public end: Date,
    public points: GraphPoint[],
    pointScale: number,
    scale?: MinMax
  ) {
    this.pointScale = pointScale;
    this.scale = scale == null ? new MinMax() : scale;
  }

  get min(): number {
    return this.scale.min;
  }

  get max(): number {
    return this.scale.max;
  }

  get empty(): boolean {
    return this.points.length === 0;
  }

  addAll(segments: SeriesSegment[]): GraphChunk {
    for (const segment of segments) {
      if (segment.start < this.start) {
        this.start = segment.start;
      }

      if (segment.end > this.end) {
      }
      this.end = segment.end;

      this.scale.extend(segment);

      for (const point of segment.points) {
        this.points.push(point);
      }
    }

    this.points.sort(sortGraphPointByTime);
    return this;
  }

  windowedBy(window: GraphWindow): GraphChunk {
    const step =
      (this.end.getTime() - this.start.getTime()) / this.points.length;
    let startIndex = (window.start.getTime() - this.start.getTime()) / step;
    const maxEndIndex = (this.end.getTime() - this.start.getTime()) / step;
    let endIndex = (window.end.getTime() - window.start.getTime()) / step;

    if (startIndex < 0) {
      startIndex = 0;
    } else if (startIndex >= this.points.length) {
      return new GraphChunk(window.start, window.end, [], this.pointScale);
    }

    if (endIndex > maxEndIndex) {
      endIndex = maxEndIndex;
    }
    if (endIndex > this.points.length) {
      endIndex = this.points.length;
    } else if (endIndex <= 0) {
      return new GraphChunk(window.start, window.end, [], this.pointScale);
    }

    // If it's the entire segment no need to make a new copy
    if (startIndex === 0 && endIndex === this.points.length) {
      return this;
    }

    const pointsSlice = this.points.slice(startIndex, endIndex);

    return new GraphChunk(
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

  static create(series: Series) {
    return new GraphChunk(new Date(), new Date(0), [], series.points).addAll(
      series.segments
    );
  }
}

export default GraphChunk;
