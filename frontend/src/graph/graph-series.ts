import MinMax from '../series/min-max';
import Series from '../series/series';
import GraphChunk from './graph-chunk';

class GraphSeries {
  private scale: MinMax;
  private finished: number;

  constructor(
    public chunks: Promise<GraphChunk>[],
    finished: number = 0,
    scale: MinMax = new MinMax()
  ) {
    this.scale = scale;
    this.finished = finished;
  }

  get min(): number {
    return this.scale.min;
  }

  get max(): number {
    return this.scale.max;
  }

  get complete(): boolean {
    return this.finished === this.chunks.length;
  }

  static create(series: Promise<Series>): GraphSeries {
    const chunks: Promise<GraphChunk>[] = [];
    const result = new GraphSeries(chunks);

    chunks.push(
      series.then((loadedSeries: Series) => {
        if (loadedSeries.segments === undefined) {
          return Promise.reject(new Error('Series must have segments.'));
        }

        result.finished++;
        const chunk = GraphChunk.create(loadedSeries);
        result.scale.extend(chunk);
        return chunk;
      })
    );

    return result;
  }
}

export default GraphSeries;
