import React, { useEffect } from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Dashboard from './dashboard';
import DashboardList from './dashboard-list';
import { useAppTheme } from '../app-theme';
import labels from '../labels';

export interface AllDashboardsPageProps {
  dashboards: Dashboard[];
  setTitle: (title: string) => void;
}

function AllDashboardsPage({
  dashboards,
  setTitle,
}: AllDashboardsPageProps): React.ReactElement {
  let [theme] = useAppTheme();

  useEffect(() => {
    setTitle(labels('allDashboardsPageTitle'));
  }, [setTitle]);

  return (
    <Row>
      <Col sm={6} md={5} lg={4}>
        <DashboardList items={dashboards} theme={theme} />
      </Col>
    </Row>
  );
}

export default AllDashboardsPage;
