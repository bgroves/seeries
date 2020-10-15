import { GraphWindow } from '../graph/graph-window';
import DashboardGraph, { DashboardGraphJSON } from './dashboard-graph';

export interface DashboardMap {
  [key: string]: Dashboard;
}

interface DashboardJSON {
  name: string;
  title: string;
  start: number | string | Date;
  end: number | string | Date;
  points: number;
  live: boolean;
  graphs: DashboardGraphJSON[];
}

class Dashboard implements GraphWindow {
  name: string;
  title: string;
  start: Date;
  end: Date;
  points: number;
  live: boolean;
  graphs: DashboardGraph[];

  constructor(
    name: string,
    title: string,
    start: Date,
    end: Date,
    points: number,
    live: boolean,
    graphs: DashboardGraph[]
  ) {
    this.name = name;
    this.title = title;
    this.start = start;
    this.end = end;
    this.points = points;
    this.live = live;
    this.graphs = graphs;
  }

  get requiredSeries(): string[] {
    const byName: { [key: string]: boolean } = {};

    for (let i = 0; i < this.graphs.length; i++) {
      const graph = this.graphs[i];
      for (let j = 0; j < graph.series.length; j++) {
        byName[graph.series[j]] = true;
      }
    }
    return Object.keys(byName);
  }

  static fromJSON(json: DashboardJSON | string): Dashboard {
    if (typeof json === 'string') {
      return JSON.parse(json, Dashboard.reviver);
    } else {
      const graph = Object.create(Dashboard.prototype);
      return Object.assign(graph, json, {
        start: new Date(json.start),
        end: new Date(json.end),
        graphs: json.graphs.map(DashboardGraph.fromJSON),
      });
    }
  }

  static reviver(key: string, value: any): any {
    return key === '' ? Dashboard.fromJSON(value) : value;
  }
}

export default Dashboard;
