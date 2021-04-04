import GraphWindow from '../graph/graph-window';
import DashboardGraph from './dashboard-graph';
import SeriesID from '../series/series-id';
import {
  isDatelike,
  isIntegerParseable,
  isNonEmptyString,
} from '../validation';

export interface DashboardMap {
  [key: string]: Dashboard;
}

export interface DashboardParams {
  start?: any;
  end?: any;
  points?: any;
  live?: any;
}

class Dashboard implements GraphWindow {
  constructor(
    public name: string,
    public title: string,
    public start: Date,
    public end: Date,
    public points: number,
    public live: boolean,
    public graphs: DashboardGraph[]
  ) {}

  get pointScale(): number {
    return this.points;
  }

  get requiredSeries(): SeriesID[] {
    const byName: { [key: string]: SeriesID } = {};

    for (let i = 0; i < this.graphs.length; i++) {
      const graph = this.graphs[i];
      for (let j = 0; j < graph.series.length; j++) {
        const id = graph.series[j];
        byName[id.hashKey()] = id;
      }
    }
    return Object.values(byName);
  }

  withParams(params: DashboardParams): Dashboard {
    const result = this.clone();
    const start = params.start;
    if (isDatelike(start)) {
      result.start = new Date(start);
    }
    const end = params.end;
    if (isDatelike(end)) {
      result.end = new Date(end);
    }
    const points = params.points;
    if (isIntegerParseable(points)) {
      result.points = parseInt(points);
    }
    const live = params.live;
    if (isNonEmptyString(live)) {
      result.live = live.toLowerCase().indexOf('t') >= 0;
    }
    return result;
  }

  clone(): Dashboard {
    return new Dashboard(
      this.name,
      this.title,
      this.start,
      this.end,
      this.points,
      this.live,
      this.graphs
    );
  }
}

export default Dashboard;
