import React from 'react';
import Col from 'react-bootstrap/Col';
import useResizeObserver from 'use-resize-observer';
import GraphAreaChart from '../graph/graph-area-chart';
import GraphSeries from '../graph/graph-series';
import './dashboard-detail-graph.scss';

export interface DashboardDetailGraphProps {
  graph: GraphSeries;
}

export default function DashboardDetailGraph({
  graph,
}: DashboardDetailGraphProps): React.ReactElement {
  const { ref, width = 1 } = useResizeObserver<HTMLDivElement>();
  const cols = graph.graph.cols;

  return (
    <Col
      xs={cols.xs}
      sm={cols.sm}
      md={cols.md}
      lg={cols.lg}
      className="dashboard-detail-graph"
    >
      <div ref={ref}>
        <h2 className="dashboard-detail-graph-title">{graph.title}</h2>
        <GraphAreaChart data={graph} width={width} height={graph.height} />
      </div>
    </Col>
  );
}
