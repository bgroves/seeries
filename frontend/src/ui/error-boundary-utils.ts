import { useCallback, useState } from 'react';

export function useAsyncError() {
  const state = useState();
  const setError = state[1];
  return useCallback(
    (e) => {
      setError(() => {
        throw e;
      });
    },
    [setError]
  );
}
