import { trackPromise } from 'react-promise-tracker';
import Dashboard from './dashboard';
import { allDashboards, dashboardsByName } from './dashboard-data-stub';

function getAllDashboards(): Promise<Dashboard[]> {
  return trackPromise(Promise.resolve(allDashboards));
}

function getDashboard(name: string): Promise<Dashboard> {
  const dashboard = dashboardsByName[name];
  return trackPromise(
    dashboard == null
      ? Promise.reject(new Error('Unknown Dashboard'))
      : Promise.resolve(dashboard)
  );
}

export { getAllDashboards, getDashboard };
