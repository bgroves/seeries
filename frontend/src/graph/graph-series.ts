import Dashboard from '../dashboard/dashboard';
import DashboardGraph from '../dashboard/dashboard-graph';
import MinMax from '../series/min-max';
import Series, { SeriesMap } from '../series/series';
import { GraphScale } from './graph-scale';
import { GraphWindow } from './graph-window';

class GraphSeries implements GraphWindow, GraphScale {
  private _scale: MinMax;
  dashboard: Dashboard;
  graph: DashboardGraph;
  series: Series[];

  constructor(
    dashboard: Dashboard,
    graph: DashboardGraph,
    series: Series[],
    scale: MinMax
  ) {
    this.dashboard = dashboard;
    this.graph = graph;
    this.series = series;
    this._scale = scale;
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

  get min(): number {
    return this._scale.min;
  }

  get max(): number {
    return this._scale.max;
  }

  static create(
    dashboard: Dashboard,
    graph: DashboardGraph,
    seriesByName: SeriesMap
  ) {
    const usedSeries = [];
    const minMax = new MinMax();

    for (const name of graph.series) {
      const series = seriesByName[name];
      if (series != null) {
        series.segments.forEach((segment) => {
          minMax.extend(segment);
        });
        usedSeries.push(series);
      }
    }

    return new GraphSeries(dashboard, graph, usedSeries, minMax);
  }
}

export default GraphSeries;
