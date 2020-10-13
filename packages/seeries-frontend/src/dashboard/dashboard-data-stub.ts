import Dashboard, { DashboardMap } from './dashboard';
import DashboardGraph from './dashboard-graph';

const one = new Dashboard(
  'one',
  'One',
  new Date(2020, 9, 1),
  new Date(2020, 9, 2),
  1000,
  false,
  [
    new DashboardGraph('Series A', ['a'], { sm: 12, lg: 4 }),
    new DashboardGraph('Series B', ['b'], { sm: 12, lg: 4 }),
    new DashboardGraph('Series C', ['c'], { sm: 12, lg: 4 }),
  ]
);

const two = new Dashboard(
  'two',
  'Two',
  new Date(2020, 9, 1),
  new Date(2020, 9, 2),
  1000,
  false,
  [new DashboardGraph('All', ['a', 'b', 'c'])]
);

const three = new Dashboard(
  'three',
  'Three',
  new Date(2020, 9, 1),
  new Date(2020, 9, 2),
  100,
  false,
  [
    new DashboardGraph('A & B', ['a', 'b']),
    new DashboardGraph('Series A', ['a'], { sm: 12, lg: 6 }),
    new DashboardGraph('Series B', ['b'], { sm: 12, lg: 6 }),
    new DashboardGraph('Series C', ['c'], { sm: 12 }),
  ]
);

const allDashboards = [one, two, three];
const dashboardsByName: DashboardMap = { one: one, two: two, three: three };

export { allDashboards, dashboardsByName };
