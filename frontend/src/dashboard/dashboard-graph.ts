import { ColProps } from 'react-bootstrap/Col';
import SeriesID from '../series/series-id';

const defaultCols: ColProps = {
  sm: 12,
};

class DashboardGraph {
  constructor(
    public title: string,
    public series: SeriesID[],
    public cols = defaultCols,
    public height = 400
  ) {}

  htmlId(): string {
    return this.title.replaceAll(/\W/g, '_');
  }
}

export default DashboardGraph;
