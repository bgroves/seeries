import React from 'react';
import Col from 'react-bootstrap/Col';
import useResizeObserver from 'use-resize-observer';
import GraphAreaChart from '../graph/graph-area-chart';
import GraphViewModel from '../graph/graph-view-model';
import './dashboard-detail-graph.scss';

export interface DashboardDetailGraphProps {
  graph: GraphViewModel;
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
        <GraphAreaChart
          series={graph.series}
          scale={graph.scale}
          window={graph}
          width={width}
          baseId={graph.baseId}
          height={graph.height}
        />
      </div>
    </Col>
  );
}
