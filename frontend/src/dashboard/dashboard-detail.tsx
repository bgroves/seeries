import React from 'react';
import Row from 'react-bootstrap/Row';
import GraphSeries from '../graph/graph-series';
import Dashboard from './dashboard';
import DashboardDetailGraph from './dashboard-detail-graph';
import DashboardTimeHeader from './dashboard-time-header';

export interface DashboardDetailProps {
  dashboard: Dashboard;
  graphs: GraphSeries[];
}

export default function DashboardDetail({
  dashboard,
  graphs,
}: DashboardDetailProps): React.ReactElement {
  return (
    <>
      <Row>
        <DashboardTimeHeader dashboard={dashboard} field="start" />
        <DashboardTimeHeader dashboard={dashboard} field="end" />
      </Row>
      <Row>
        {graphs.map((graph) => {
          return <DashboardDetailGraph graph={graph} key={graph.title} />;
        })}
      </Row>
    </>
  );
}
