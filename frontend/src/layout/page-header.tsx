import React, { useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import { AppTheme } from '../app-theme';
import Dashboard from '../dashboard/dashboard';
import LoadingIndicator from './loading-indicator';
import Navigation from './navigation';
import './page-header.scss';
import { setTitle } from '../ui/dom-utils';

export interface PageHeaderProps {
  title: string;
  dashboards?: Dashboard[];
  theme: AppTheme;
}

export default function PageHeader({
  title,
  dashboards,
  theme,
}: PageHeaderProps) {
  const headerTheme = theme.header;

  useEffect(() => {
    setTitle(title == null ? 'Seeries' : 'Seeries | ' + title);
  }, [title]);

  return (
    <header
      className={
        'page-header bg-' + headerTheme.bg + ' text-' + headerTheme.text
      }
    >
      <Navigation theme={theme} dashboards={dashboards} />
      <Container fluid={theme.fluid} className="clearfix page-title-container">
        <LoadingIndicator />
        <h1 className="page-title clear-both">{title}</h1>
      </Container>
    </header>
  );
}
