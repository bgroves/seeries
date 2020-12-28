import Dashboard, { DashboardMap } from './dashboard';
import DashboardGraph from './dashboard-graph';
import SeriesID from '../series/series-id';

const officeIds = {
  avgTemp: new SeriesID('office', 'celsius', 'AVG'),
};

const atticIds = {
  avgTemp: new SeriesID('attic', 'celsius', 'AVG'),
};

const one = new Dashboard(
  'one',
  'One',
  new Date(2020, 9, 1),
  new Date(2020, 9, 2),
  1000,
  false,
  [
    new DashboardGraph('Office Avg. Temp', [officeIds['avgTemp']], {
      sm: 12,
      lg: 4,
    }),
    new DashboardGraph('Attic Avg. Temp', [atticIds['avgTemp']], {
      sm: 12,
      lg: 4,
    }),
  ]
);

const two = new Dashboard(
  'two',
  'Two',
  new Date(2020, 9, 1),
  new Date(2020, 9, 2),
  1000,
  false,
  [new DashboardGraph('All', [officeIds['avgTemp'], atticIds['avgTemp']])]
);

const three = new Dashboard(
  'three',
  'Three',
  new Date(2020, 9, 1),
  new Date(2020, 9, 2),
  100,
  false,
  [new DashboardGraph('All', [officeIds['avgTemp'], atticIds['avgTemp']])]
);

const allDashboards = [one, two, three];
const dashboardsByName: DashboardMap = { one: one, two: two, three: three };

export { allDashboards, dashboardsByName };
