import React from 'react';
import Container from 'react-bootstrap/Container';
import { useCurrentRoute } from 'react-navi';
import { AppTheme } from '../app-theme';
import Dashboard from '../dashboard/dashboard';
import LoadingIndicator from './loading-indicator';
import Navigation from './navigation';
import './page-header.scss';

export interface PageHeaderProps {
  dashboards: Dashboard[];
  theme: AppTheme;
}

export default function PageHeader({ dashboards, theme }: PageHeaderProps) {
  const route = useCurrentRoute();
  const headerTheme = theme.header;

  return (
    <header
      className={
        'page-header bg-' + headerTheme.bg + ' text-' + headerTheme.text
      }
    >
      <Navigation theme={theme} dashboards={dashboards} />
      <Container fluid={theme.fluid} className="clearfix page-title-container">
        <LoadingIndicator />
        <h1 className="page-title clear-both">{route.title}</h1>
      </Container>
    </header>
  );
}
