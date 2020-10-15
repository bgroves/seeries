import React from 'react';
import { Link } from 'react-navi';
import { AppTheme } from '../app-theme';
import Dashboard from './dashboard';

export interface DashboardListItemProps {
  theme: AppTheme;
  item: Dashboard;
}

function DashboardListItem({ item, theme }: DashboardListItemProps) {
  const listTheme = theme.list;

  return (
    <Link
      className={
        'list-group-item list-group-item-action list-group-item-' + listTheme.bg
      }
      href={'/dashboards/' + item.name}
    >
      <h5>{item.title}</h5>
      <ul>
        {item.graphs.map((it) => {
          return <li key={it.title}>{it.title}</li>;
        })}
      </ul>
    </Link>
  );
}

export default DashboardListItem;
