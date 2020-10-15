import React from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/Row';
import { AppTheme, selectedTheme } from '../app-theme';
import labels from '../labels';
import './page-footer.scss';

export interface PageFooterProps {
  theme: AppTheme;
  toggleTheme: () => string;
}

function handleScrollTop(evt: React.MouseEvent): void {
  evt.preventDefault();
  window.scrollTo({ top: 0 });
}

export default function PageFooter({ theme, toggleTheme }: PageFooterProps) {
  const footTheme = theme.footer;
  return (
    <footer
      className={'page-footer bg-' + footTheme.bg + ' text-' + footTheme.text}
    >
      <Container fluid={theme.fluid}>
        <Row>
          <Col xs={2} sm={3} md={4}></Col>
          <Col xs={8} sm={6} md={4}>
            <button
              className="btn btn-lg btn-block btn-secondary"
              onClick={handleScrollTop}
            >
              {labels('scrollToTop')}
            </button>
          </Col>
          <Col xs={2} sm={3} md={4} className="text-right">
             {' '}
            <button className="btn btn-lg btn-secondary" onClick={toggleTheme}>
              {labels(selectedTheme() + 'Theme')}
            </button>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}
