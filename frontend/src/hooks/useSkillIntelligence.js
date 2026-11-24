/**
 * @file useSkillIntelligence.js
 * @description React hook querying live Skill Intelligence radar datasets.
 * @author Sargam Banerjee (Member 4)
 */

import { useCallback } from 'react';
import useAgentQuery from './useAgentQuery';
import agentService from '../services/agentService';

export function useSkillIntelligence() {
  const queryFn = useCallback(() => agentService.getSkillIntelligence(), []);
  return useAgentQuery(queryFn);
}

export default useSkillIntelligence;
