import { ColProps } from 'react-bootstrap/Col';

export interface DashboardGraphJSON {
  title: string;
  height: number;
  series: string[];
  cols: ColProps;
}

const defaultCols: ColProps = {
  sm: 12,
};

class DashboardGraph {
  title: string;
  height: number;
  series: string[];
  cols: ColProps;

  constructor(
    title: string,
    series: string[],
    cols = defaultCols,
    height = 400
  ) {
    this.title = title;
    this.series = series;
    this.cols = cols;
    this.height = height;
  }

  static fromJSON(json: DashboardGraphJSON | string): DashboardGraph {
    if (typeof json === 'string') {
      return JSON.parse(json, DashboardGraph.reviver);
    } else {
      const graph = Object.create(DashboardGraph.prototype);
      return Object.assign(graph, json);
    }
  }

  static reviver(key: string, value: any): any {
    return key === '' ? DashboardGraph.fromJSON(value) : value;
  }
}

export default DashboardGraph;
