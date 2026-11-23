/**
 * @file useAgentQuery.js
 * @description Reusable React hook managing asynchronous agent query lifecycle,
 * state resolution, error handling, and latency telemetry profiling.
 * @author Sargam Banerjee (Member 4)
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export function useAgentQuery(queryFn, deps = []) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latencyMs, setLatencyMs] = useState(null);
  const isMountedRef = useRef(true);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const start = Date.now();

    try {
      const result = await queryFn();
      if (isMountedRef.current) {
        setData(result);
        setLatencyMs(result?.latencyMs ?? Date.now() - start);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.response?.data?.message || err.message || 'Agent query failed');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [queryFn]);

  useEffect(() => {
    isMountedRef.current = true;
    execute();
    return () => {
      isMountedRef.current = false;
    };
  }, deps);

  return {
    data,
    isLoading,
    error,
    latencyMs,
    refetch: execute
  };
}

export default useAgentQuery;
