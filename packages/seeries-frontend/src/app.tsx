import React, { Suspense } from 'react';
import { Router, View } from 'react-navi';
import routes from './app-routes';

function App(): React.ReactElement {
  return (
    <Router routes={routes}>
      <Suspense fallback={null}>
        <View />
      </Suspense>
    </Router>
  );
}

export default App;
