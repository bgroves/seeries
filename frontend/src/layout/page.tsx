import React from 'react';
import { AppTheme } from '../app-theme';
import Dashboard from '../dashboard/dashboard';
import PageFooter from './page-footer';
import PageHeader from './page-header';
import './page.scss';

export interface PageProps {
  dashboards: Dashboard[];
  children: any;
  theme: AppTheme;
  toggleTheme: () => string;
}

export default function Page({
  dashboards,
  theme,
  children,
  toggleTheme,
}: PageProps) {
  const pageTheme = theme.page;

  return (
    <div className={'page page-' + pageTheme.bg}>
      <PageHeader theme={theme} dashboards={dashboards} />
      <main
        className={
          'page-main container-fluid bg-' +
          pageTheme.bg +
          ' text-' +
          pageTheme.text
        }
      >
        {children}
      </main>
      <PageFooter theme={theme} toggleTheme={toggleTheme} />
    </div>
  );
}
