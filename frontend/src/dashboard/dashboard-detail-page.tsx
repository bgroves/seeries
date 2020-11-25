import React from 'react';
import { useAppTheme } from '../app-theme';
import GraphViewModel from '../graph/graph-view-model';
import Page from '../layout/page';
import Dashboard from './dashboard';
import DashboardDetail from './dashboard-detail';

export interface DashboardDetailPageProps {
  allDashboards: Dashboard[];
  dashboard: Dashboard;
  graphs: GraphViewModel[];
}

function DashboardDetailPage({
  allDashboards,
  dashboard,
  graphs,
}: DashboardDetailPageProps): React.ReactElement {
  const [theme, toggleAppTheme] = useAppTheme();

  return (
    <Page dashboards={allDashboards} theme={theme} toggleTheme={toggleAppTheme}>
      <DashboardDetail dashboard={dashboard} graphs={graphs} />
    </Page>
  );
}

export default DashboardDetailPage;
