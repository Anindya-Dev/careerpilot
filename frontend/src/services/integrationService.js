/**
 * @file integrationService.js
 * @description Production API service for Resume Parsing, Live GitHub Repository Ingestion,
 * and Live LeetCode DSA Standard Diagnostics.
 */

import { orchestratorClient } from '../api/client';

function getEndpoint(subpath) {
  // orchestratorClient.defaults.baseURL is typically http://localhost:8000/api/v1/orchestrator
  // or http://localhost:8000/api/v1; our router mounts both /api/v1/orchestrator/integrations/...
  // and /api/v1/integrations/... so `/integrations/...` works cleanly in both cases.
  return `/integrations${subpath}`;
}

export const integrationService = {
  /**
   * Upload a PDF/TXT resume and extract structured skills & target role.
   */
  async parseResume(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await orchestratorClient.post(getEndpoint('/resume/parse'), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000
    });
    return res.data;
  },

  /**
   * Upload official LinkedIn Profile PDF ("More -> Save to PDF") to extract certifications & skills.
   */
  async parseLinkedinPdf(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await orchestratorClient.post(getEndpoint('/linkedin/parse'), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000
    });
    return res.data;
  },

  /**
   * Fetch live GitHub profile, repositories, and verified language skills.
   */
  async fetchGithubProfile(username) {
    const clean = encodeURIComponent(username.trim().replace(/^@/, ''));
    const res = await orchestratorClient.get(getEndpoint(`/github/${clean}`), {
      timeout: 15000
    });
    return res.data;
  },

  /**
   * Fetch live LeetCode solved counts, topic breakdown, and DSA standard diagnostics.
   */
  async fetchLeetcodeStats(username) {
    const clean = encodeURIComponent(username.trim());
    const res = await orchestratorClient.get(getEndpoint(`/leetcode/${clean}`), {
      timeout: 15000
    });
    return res.data;
  },

  /**
   * Dynamically research market skill requirements for the student's target role
   * via live Job Board MCP + Groq LLM and benchmark their actual skills.
   */
  async benchmarkSkills(targetRole, skills) {
    const res = await orchestratorClient.post(
      getEndpoint('/skills/benchmark'),
      { target_role: targetRole || 'Software Engineer', skills: skills || [] },
      { timeout: 25000 }
    );
    return res.data;
  },

  async discoverJobs({ targetRole, skills = [], category = 'all', search = '', limit = 30 } = {}) {
    const res = await orchestratorClient.post(
      getEndpoint('/jobs/discover'),
      {
        target_role: targetRole || 'Software Engineer',
        skills: skills || [],
        category,
        search,
        limit
      },
      { timeout: 30000 }
    );
    return res.data;
  },

  async generateOutreachEmail({
    jobTitle,
    company,
    contactEmail = '',
    jobDescription = '',
    studentName = 'Candidate',
    targetRole = 'Software Engineer',
    skills = [],
    projects = []
  }) {
    const res = await orchestratorClient.post(
      getEndpoint('/jobs/outreach'),
      {
        job_title: jobTitle,
        company,
        contact_email: contactEmail,
        job_description: jobDescription,
        student_name: studentName,
        target_role: targetRole,
        skills,
        projects
      },
      { timeout: 25000 }
    );
    return res.data;
  }
};

export default integrationService;

