import React from 'react';
import AppRouter from './app-router';
import PageErrorBoundary from './layout/page-error-boundary';

function App(): React.ReactElement {
  return (
    <PageErrorBoundary>
      <AppRouter />
    </PageErrorBoundary>
  );
}

export default App;
