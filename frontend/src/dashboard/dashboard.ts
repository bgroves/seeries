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

  withParams(params: any): Dashboard {
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

  // static fromJSON(json: DashboardJSON | string): Dashboard {
  //   if (typeof json === 'string') {
  //     return JSON.parse(json, Dashboard.reviver);
  //   } else {
  //     const graph = Object.create(Dashboard.prototype);
  //     return Object.assign(graph, json, {
  //       start: new Date(json.start),
  //       end: new Date(json.end),
  //       graphs: json.graphs.map(DashboardGraph.fromJSON),
  //     });
  //   }
  // }

  // static reviver(key: string, value: any): any {
  //   return key === '' ? Dashboard.fromJSON(value) : value;
  // }
}

export default Dashboard;
