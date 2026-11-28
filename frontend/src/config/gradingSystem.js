/**
 * @file gradingSystem.js
 * @description Centralized Career Health Grading System Configuration.
 * Configured with 5 standardized tiers: A+, A, B+, B, and C (eliminating A- and B-).
 * Thresholds and metadata are fully parameterized here so teammates can easily inspect
 * and customize the grading rubric without modifying component or page logic.
 * @author Md Hussain Ansari (Member 1) & Anindya Bhattacharya (Member 2)
 */

export const GRADING_TIERS = [
  {
    grade: 'A+',
    minScore: 90,
    maxScore: 100,
    label: 'Elite / Industry Ready',
    description: 'Top-tier portfolio, verified AST evidence, and high market-skill alignment.',
    color: '#70E000', // Lime green
    badgeBg: 'bg-[#70E000]',
    textColor: 'text-[#70E000]'
  },
  {
    grade: 'A',
    minScore: 80,
    maxScore: 89.9,
    label: 'Strong Competitor',
    description: 'Solid technical depth with minor skill or project evidence gaps for target role.',
    color: '#70E000',
    badgeBg: 'bg-[#70E000]/80',
    textColor: 'text-[#70E000]'
  },
  {
    grade: 'B+',
    minScore: 70,
    maxScore: 79.9,
    label: 'Promising Candidate',
    description: 'Good fundamentals. Recommended to close critical framework and system design gaps.',
    color: '#38B6FF', // Bright Blue
    badgeBg: 'bg-[#38B6FF]',
    textColor: 'text-[#38B6FF]'
  },
  {
    grade: 'B',
    minScore: 60,
    maxScore: 69.9,
    label: 'Developing Competency',
    description: 'Foundational capabilities established. Requires more hands-on project artifacts.',
    color: '#FFE600', // Yellow
    badgeBg: 'bg-[#FFE600]',
    textColor: 'text-[#FFE600]'
  },
  {
    grade: 'C',
    minScore: 0,
    maxScore: 59.9,
    label: 'Early Stage / Needs Work',
    description: 'Initial profile stage. Needs target role definition, skill inventory, and code repositories.',
    color: '#FF70A6', // Coral/Pink
    badgeBg: 'bg-[#FF70A6]',
    textColor: 'text-[#FF70A6]'
  }
];

/**
 * Calculates the letter grade from a numeric career health score (0 - 100).
 * Matches strictly against GRADING_TIERS: A+, A, B+, B, C.
 * @param {number|string} score - Raw numeric score
 * @returns {string} Grade ('A+' | 'A' | 'B+' | 'B' | 'C' | 'N/A')
 */
export function computeHealthGrade(score) {
  const s = Number(score);
  if (isNaN(s) || s <= 0) return 'N/A';

  for (const tier of GRADING_TIERS) {
    if (s >= tier.minScore) {
      return tier.grade;
    }
  }
  return 'C';
}

/**
 * Retrieves the full metadata object for a given grade or score.
 * @param {string|number} gradeOrScore - Letter grade ('A+') or numeric score (85)
 * @returns {object} Tier metadata including color, label, and description
 */
export function getGradeMetadata(gradeOrScore) {
  const grade = typeof gradeOrScore === 'number'
    ? computeHealthGrade(gradeOrScore)
    : (gradeOrScore || 'N/A');

  const match = GRADING_TIERS.find((t) => t.grade === grade);
  return (
    match || {
      grade: 'N/A',
      label: 'Pending Evaluation',
      description: 'Profile not yet evaluated by AI agent orchestrator.',
      color: '#94A3B8',
      badgeBg: 'bg-slate-300',
      textColor: 'text-slate-500'
    }
  );
}

export default {
  GRADING_TIERS,
  computeHealthGrade,
  getGradeMetadata
};
