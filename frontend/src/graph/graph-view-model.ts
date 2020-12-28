import Dashboard from '../dashboard/dashboard';
import DashboardGraph from '../dashboard/dashboard-graph';
import MinMax from '../series/min-max';
import Series from '../series/series';
import SeriesMap from '../series/series-map';
import GraphSeries from './graph-series';
import GraphWindow from './graph-window';

class GraphViewModel implements GraphWindow {
  series: GraphSeries[];

  constructor(
    private dashboard: Dashboard,
    public graph: DashboardGraph,
    series: GraphSeries[]
  ) {
    this.series = series;
  }

  get baseId(): string {
    return this.graph.htmlId();
  }

  onAllFinished(): Promise<boolean> {
    return new Promise((resolve) => {
      this.series.map((series) => {
        return Promise.all(series.chunks).then(() => {
          resolve(true);
        });
      });
    });
  }

  get scale(): MinMax {
    const scale = new MinMax();
    for (const s of this.series) {
      scale.extend(s);
    }
    return scale;
  }

  get pointScale(): number {
    return this.dashboard.points;
  }

  get title(): string {
    return this.graph.title;
  }

  get height(): number {
    return this.graph.height;
  }

  get start(): Date {
    return this.dashboard.start;
  }

  get end(): Date {
    return this.dashboard.end;
  }

  static async create(
    dashboard: Dashboard,
    graph: DashboardGraph,
    map: SeriesMap
  ): Promise<GraphViewModel> {
    const toCreate: GraphSeries[] = [];
    const toLoad: Promise<Series>[] = [];

    for (const name of graph.series) {
      const series = map.get(name);
      if (series === undefined) {
        throw new Error(`Unknown series "${name}"`);
      }
      toLoad.push(series);
      toCreate.push(GraphSeries.create(series));
    }

    return Promise.all(toLoad).then(() => {
      return new GraphViewModel(dashboard, graph, toCreate);
    });
  }
}

export default GraphViewModel;
