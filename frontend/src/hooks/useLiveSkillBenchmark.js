/**
 * @file useLiveSkillBenchmark.js
 * @description React hook that queries the Agent Orchestrator's live
 * Job Board MCP + Groq LLM market research endpoint for the student's target role.
 */

import { useState, useEffect } from 'react';
import integrationService from '../services/integrationService';

export function useLiveSkillBenchmark(skills = [], targetRole = '', isDemoSession = false) {
  const [radarData, setRadarData] = useState([]);
  const [narrative, setNarrative] = useState('');
  const [isResearching, setIsResearching] = useState(false);

  const skillsKey = JSON.stringify(
    (skills || []).map((s) => ({ n: s.name, l: s.level, v: Boolean(s.verified) }))
  );

  useEffect(() => {
    if (isDemoSession) return;
    if (!skills || skills.length === 0) {
      setRadarData([]);
      setNarrative('');
      return;
    }

    const effectiveRole = targetRole && targetRole !== 'Target Role Unassigned'
      ? targetRole
      : 'Software Development Engineer';
    const cacheKey = `cp_radar_${effectiveRole}_${skillsKey}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setRadarData(parsed.radarData || []);
        setNarrative(parsed.narrative || '');
        return;
      } catch {
        // Ignore invalid cache
      }
    }

    let cancelled = false;
    setIsResearching(true);

    integrationService
      .benchmarkSkills(effectiveRole, skills)
      .then((res) => {
        if (cancelled) return;
        const data = res?.radarData || [];
        const note = res?.narrative || '';
        setRadarData(data);
        setNarrative(note);
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify({ radarData: data, narrative: note }));
        } catch {
          // Ignore storage quota errors
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRadarData([]);
        }
      })
      .finally(() => {
        if (!cancelled) setIsResearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [skillsKey, targetRole, isDemoSession]);

  return { radarData, narrative, isResearching };
}
