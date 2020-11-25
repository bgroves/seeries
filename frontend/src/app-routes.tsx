import { mount, redirect, route } from 'navi';
import React from 'react';
import AllDashboardsPage from './dashboard/all-dashboards-page';
import { getAllDashboards, getDashboard } from './dashboard/dashboard-api';
import DashboardDetailPage from './dashboard/dashboard-detail-page';
import GraphViewModel from './graph/graph-view-model';
import labels from './labels';
import { fetchAllSeries } from './series/series-api';

const appRoutes = mount({
  '/': redirect('/dashboards'),
  '/home': redirect('/dashboards'),

  '/dashboards': route(async () => {
    const dashboards = await getAllDashboards();

    return {
      title: labels('allDashboardsPageTitle'),
      view: <AllDashboardsPage dashboards={dashboards} />,
    };
  }),

  '/dashboards/:name': route(async (req) => {
    const name = req.params.name;
    const allDashboards = await getAllDashboards();
    const dashboard = await getDashboard(name, req.params);
    const series = fetchAllSeries(dashboard, dashboard.requiredSeries);
    const graphs = await Promise.all(
      dashboard.graphs.map((it) => {
        return GraphViewModel.create(dashboard, it, series);
      })
    );

    return {
      title: labels('dashboardDetailPageTitle', { title: dashboard.title }),
      view: (
        <DashboardDetailPage
          allDashboards={allDashboards}
          dashboard={dashboard}
          graphs={graphs}
        />
      ),
    };
  }),
});

export default appRoutes;
