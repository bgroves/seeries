import React from 'react';
import { usePromiseTracker } from 'react-promise-tracker';
import './loading-indicator.scss';
import logo from './logo.svg';

function LoadingIndicator() {
  const { promiseInProgress } = usePromiseTracker({ delay: 300 });

  return promiseInProgress ? (
    <img src={logo} className="loading-indicator" alt="loading indicator" />
  ) : null;
}

export default LoadingIndicator;
