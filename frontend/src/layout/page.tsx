import React from 'react';
import Dashboard from '../dashboard/dashboard';
import PageFooter from './page-footer';
import PageHeader from './page-header';
import PageErrorBoundary from './page-error-boundary';
import { useAppTheme } from '../app-theme';
import './page.scss';

export interface PageProps {
  title: string;
  dashboards: Dashboard[];
  children: any;
}

export default function Page({ dashboards, children, title }: PageProps) {
  const [theme, toggleAppTheme] = useAppTheme();
  const pageTheme = theme.page;

  return (
    <div className={'page page-' + pageTheme.bg}>
      <PageHeader theme={theme} dashboards={dashboards} title={title} />
      <main
        className={
          'page-main container-fluid bg-' +
          pageTheme.bg +
          ' text-' +
          pageTheme.text
        }
      >
        <PageErrorBoundary children={children}></PageErrorBoundary>
      </main>
      <PageFooter theme={theme} toggleTheme={toggleAppTheme} />
    </div>
  );
}
