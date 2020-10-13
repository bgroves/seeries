import React from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { useAppTheme } from '../app-theme';
import Page from '../layout/page';
import Dashboard from './dashboard';
import DashboardList from './dashboard-list';

export interface AllDashboardsPageProps {
  dashboards: Dashboard[];
}

function AllDashboardsPage({
  dashboards,
}: AllDashboardsPageProps): React.ReactElement {
  const [theme, toggleAppTheme] = useAppTheme();

  return (
    <Page dashboards={dashboards} theme={theme} toggleTheme={toggleAppTheme}>
      <Row>
        <Col sm={6} md={5} lg={4}>
          <DashboardList items={dashboards} theme={theme} />
        </Col>
      </Row>
    </Page>
  );
}

export default AllDashboardsPage;
