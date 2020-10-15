import React from 'react';
import Col from 'react-bootstrap/Col';
import labels from '../labels';
import Dashboard from './dashboard';

export interface DashboardTimeHeaderProps {
  dashboard: Dashboard;
  field: 'start' | 'end';
}

export default function DashboardTimeHeader({
  dashboard,
  field,
}: DashboardTimeHeaderProps): React.ReactElement {
  const time = dashboard[field];
  return (
    <Col sm={6}>
      <h4>{labels(field + 'Time')}</h4>
      <time dateTime={time.toISOString()}>
        {time.toLocaleDateString() + ' ' + time.toLocaleTimeString()}
      </time>
    </Col>
  );
}
