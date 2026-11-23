/**
 * @file agentService.js
 * @description Frontend API service for interacting with LangGraph agent workspaces.
 * @author Sargam Banerjee (Member 4)
 */

import { orchestratorClient } from '../api/client';

export const agentService = {
  /**
   * Fetch real-time Skill Intelligence radar benchmark and identified gaps.
   */
  async getSkillIntelligence() {
    try {
      const res = await orchestratorClient.get('/agents/skill-intelligence');
      return { ...res.data, latencyMs: res.latencyMs || 0, source: 'live' };
    } catch {
      return {
        radarData: [
          { skill: 'React', student: 85, market: 80, fullMark: 100 },
          { skill: 'Node.js', student: 78, market: 82, fullMark: 100 },
          { skill: 'Python', student: 70, market: 75, fullMark: 100 },
          { skill: 'PostgreSQL', student: 65, market: 72, fullMark: 100 },
          { skill: 'Docker', student: 45, market: 80, fullMark: 100 },
          { skill: 'System Design', student: 40, market: 75, fullMark: 100 },
          { skill: 'Git / CI/CD', student: 80, market: 78, fullMark: 100 }
        ],
        gaps: [
          { skill: 'Docker', current: 45, target: 80, severity: 'critical', demand: '82% of job postings' },
          { skill: 'System Design', current: 40, target: 75, severity: 'critical', demand: '76% of job postings' },
          { skill: 'PostgreSQL', current: 65, target: 72, severity: 'moderate', demand: '68% of job postings' }
        ],
        narrative: 'Strong frontend and language foundations. High-leverage priority: Focus on Docker containerization and system architecture fundamentals.',
        latencyMs: 18,
        source: 'preview'
      };
    }
  },

  /**
   * Fetch Career Health breakdown.
   */
  async getCareerHealth() {
    try {
      const res = await orchestratorClient.get('/agents/career-health');
      return { ...res.data, latencyMs: res.latencyMs || 0, source: 'live' };
    } catch {
      return {
        overallScore: 78.5,
        grade: 'B+',
        breakdown: [
          { factor: 'Skill Alignment', score: 82, weight: 0.35 },
          { factor: 'Evidence Credibility', score: 74, weight: 0.25 },
          { factor: 'Market Readiness', score: 70, weight: 0.20 },
          { factor: 'Interview Preparedness', score: 65, weight: 0.20 }
        ],
        latencyMs: 15,
        source: 'preview'
      };
    }
  }
};

export default agentService;
