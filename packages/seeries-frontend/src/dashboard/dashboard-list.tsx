import React from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import { AppTheme } from '../app-theme';
import Dashboard from './dashboard';
import DashboardListItem from './dashboard-list-item';

export interface DashboardListProps {
  theme: AppTheme;
  items: Dashboard[];
}

function DashboardList({ items, theme }: DashboardListProps) {
  return (
    <ListGroup>
      {items.map((it) => {
        return <DashboardListItem key={it.name} item={it} theme={theme} />;
      })}
    </ListGroup>
  );
}

export default DashboardList;
