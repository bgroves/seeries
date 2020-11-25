import GraphWindow from '../graph/graph-window';
import SeriesID from './series-id';
import SeriesSegment from './series-segment';

class Series {
  constructor(
    public id: SeriesID,
    public points: number,
    public segments: SeriesSegment[]
  ) {}

  windowedBy(window: GraphWindow): Series {
    const windowedSegments = this.segments
      .map((it) => {
        return it.windowedBy(window);
      })
      .filter((it) => {
        return !it.empty;
      });

    return new Series(this.id, this.points, windowedSegments);
  }
}

export default Series;
