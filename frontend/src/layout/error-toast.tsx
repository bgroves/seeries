import React, { ErrorInfo } from 'react';
import './error-toast.scss';

export interface ErrorToastProps {
  error?: Error;
  errorInfo?: ErrorInfo;
}

export default function ErrorToast({ error, errorInfo }: ErrorToastProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={error === undefined ? 'toast fade hide' : 'toast fade show'}
      data-autohide="false"
    >
      <div className="toast-header">
        <strong className="mr-auto">{error?.name}</strong>
        <button
          type="button"
          className="ml-2 mb-1 close"
          data-dismiss="toast"
          aria-label="Close"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div className="toast-body">{error?.message}</div>
    </div>
  );
}
