import React, { useState } from 'react';
import Row from 'react-bootstrap/Row';
import { useHistory } from 'react-router-dom';
import GraphViewModel from '../graph/graph-view-model';
import Dashboard from './dashboard';
import DashboardDetailForm from './dashboard-detail-form';
import DashboardDetailGraph from './dashboard-detail-graph';

export interface DashboardDetailProps {
  dashboard: Dashboard;
  graphs: GraphViewModel[];
}

export default function DashboardDetail({
  dashboard,
  graphs,
}: DashboardDetailProps): React.ReactElement {
  const [dummy, setDummy] = useState<number>(0);
  const history = useHistory();

  function updateWindow(): void {
    history.push(
      '/dashboards/' +
        dashboard.name +
        '?start=' +
        dashboard.start.toISOString() +
        '&end=' +
        dashboard.end.toISOString() +
        '&live=' +
        dashboard.live
    );
  }

  function onStartChange(d: Date) {
    if (
      dashboard.start.getTime() !== d.getTime() &&
      dashboard.end.getTime() > d.getTime() &&
      d.getFullYear() >= 1970
    ) {
      dashboard.start = d;
      updateWindow();
      setDummy(dummy + 1);
    }
  }

  function onEndChange(d: Date) {
    if (dashboard.end.getTime() !== d.getTime()) {
      dashboard.end = d;
      updateWindow();
      setDummy(dummy + 1);
    }
  }

  function onLiveChange(b: boolean) {
    if (dashboard.live !== b) {
      dashboard.live = b;
      updateWindow();
      setDummy(dummy + 1);
    }
  }

  return (
    <>
      <DashboardDetailForm
        start={dashboard.start}
        end={dashboard.end}
        live={dashboard.live}
        name={dashboard.name}
        onStartChange={onStartChange}
        onEndChange={onEndChange}
        onLiveChange={onLiveChange}
      />
      <Row>
        {graphs.map((graph) => {
          return <DashboardDetailGraph graph={graph} key={graph.title} />;
        })}
      </Row>
    </>
  );
}
