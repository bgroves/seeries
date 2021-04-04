import React, { useEffect, useState } from 'react';

import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import AllDashboardsPage from './dashboard/all-dashboards-page';
import { getAllDashboards } from './dashboard/dashboard-api';
import DashboardDetailPage from './dashboard/dashboard-detail-page';
import Dashboard from './dashboard/dashboard';
import Page from './layout/page';
import PageErrorBoundary from './layout/page-error-boundary';

export default function AppRouter() {
  let [dashboards, setDashboards] = useState<Dashboard[]>([]);
  let [title, setTitle] = useState('');

  useEffect(() => {
    getAllDashboards().then((data: Dashboard[]) => {
      setDashboards(data);
    });
  }, []);

  return (
    <BrowserRouter>
      <Page dashboards={dashboards} title={title}>
        <Switch>
          <Route exact path="/">
            <Redirect to="/dashboards" />
          </Route>
          <Route exact path="/dashboards">
            <AllDashboardsPage dashboards={dashboards} setTitle={setTitle} />
          </Route>
          <Route path="/dashboards/:name">
            <PageErrorBoundary>
              <DashboardDetailPage setTitle={setTitle} />
            </PageErrorBoundary>
          </Route>
        </Switch>
      </Page>
    </BrowserRouter>
  );
}
