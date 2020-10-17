import { GraphWindow } from '../graph/graph-window';
import SeriesSegment, { SeriesSegmentJSON } from './series-segment';

export interface SeriesMap {
  [key: string]: Series;
}

interface SeriesJSON {
  name: string;
  segments: SeriesSegmentJSON[];
  points: number;
}

class Series {
  name: string;
  segments: SeriesSegment[];
  points: number;

  constructor(name: string, segments: SeriesSegment[], points: number) {
    this.name = name;
    this.segments = segments;
    this.points = points;
  }

  windowedBy(window: GraphWindow): Series {
    const windowedSegments = this.segments
      .map((it) => {
        return it.windowedBy(window);
      })
      .filter((it) => {
        return !it.empty;
      });

    return new Series(this.name, windowedSegments, this.points);
  }

  static create(props: SeriesJSON): Series {
    const result = Object.create(Series.prototype);
    return Object.assign(result, props, {
      segments: props.segments.map(SeriesSegment.fromJSON),
    });
  }

  static fromJSON(json: SeriesJSON | string): Series {
    if (typeof json === 'string') {
      return JSON.parse(json, Series.reviver);
    } else {
      return Series.create(json);
    }
  }

  static reviver(key: string, value: any): any {
    return key === '' ? Series.fromJSON(value) : value;
  }
}

export default Series;
