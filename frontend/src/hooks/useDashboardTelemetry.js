/**
 * @file useDashboardTelemetry.js
 * @description React hook streaming real-time career telemetry metrics to the dashboard.
 * @author Sargam Banerjee (Member 4)
 */

import { useCallback } from 'react';
import useAgentQuery from './useAgentQuery';
import telemetryService from '../services/telemetryService';

export function useDashboardTelemetry() {
  const queryFn = useCallback(() => telemetryService.getDashboardTelemetry(), []);
  return useAgentQuery(queryFn);
}

export default useDashboardTelemetry;
