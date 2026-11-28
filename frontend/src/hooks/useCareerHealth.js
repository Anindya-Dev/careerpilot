/**
 * @file useCareerHealth.js
 * @description React hook querying live Career Health index and dimension scores.
 * @author Sargam Banerjee (Member 4)
 */

import { useCallback } from 'react';
import useAgentQuery from './useAgentQuery';
import agentService from '../services/agentService';

export function useCareerHealth() {
  const queryFn = useCallback(() => agentService.getCareerHealth(), []);
  return useAgentQuery(queryFn);
}

export default useCareerHealth;
