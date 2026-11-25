/**
 * @file skillBenchmark.js
 * @description Computes real-time Market Skill Alignment Radar vectors directly
 * from a student's actual profile skills and target role prerequisites.
 */

const ROLE_CORE_BENCHMARKS = {
  ai: ['Python', 'PyTorch', 'FastAPI', 'LangChain', 'Docker', 'RAG', 'MLOps'],
  ml: ['Python', 'PyTorch', 'Scikit-learn', 'Docker', 'FastAPI', 'SQL', 'MLOps'],
  data: ['Python', 'SQL', 'Pandas', 'Scikit-learn', 'PyTorch', 'Docker'],
  backend: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker', 'System Design', 'CI/CD'],
  frontend: ['React', 'TypeScript', 'JavaScript', 'Next.js', 'Tailwind CSS', 'Git'],
  fullstack: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'Redis', 'CI/CD'],
  devops: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'Linux', 'CI/CD', 'Prometheus'],
  default: ['Python', 'SQL', 'Git', 'Docker', 'System Design']
};

function getLevelScore(level, verified) {
  const baseMap = {
    beginner: 45,
    intermediate: 70,
    advanced: 85,
    expert: 95
  };
  const base = baseMap[String(level || 'intermediate').toLowerCase()] || 65;
  return Math.min(base + (verified ? 10 : 0), 100);
}

function getRoleBenchmarks(targetRole = '') {
  const lower = targetRole.toLowerCase();
  if (lower.includes('ai') || lower.includes('llm') || lower.includes('nlp')) return ROLE_CORE_BENCHMARKS.ai;
  if (lower.includes('machine learning') || lower.includes('ml')) return ROLE_CORE_BENCHMARKS.ml;
  if (lower.includes('data')) return ROLE_CORE_BENCHMARKS.data;
  if (lower.includes('backend')) return ROLE_CORE_BENCHMARKS.backend;
  if (lower.includes('frontend')) return ROLE_CORE_BENCHMARKS.frontend;
  if (lower.includes('full')) return ROLE_CORE_BENCHMARKS.fullstack;
  if (lower.includes('devops') || lower.includes('cloud') || lower.includes('sre')) return ROLE_CORE_BENCHMARKS.devops;
  return ROLE_CORE_BENCHMARKS.default;
}

/**
 * Build radar chart data strictly from the student's real skills and target role.
 */
export function buildLiveRadarData(skills = [], targetRole = '') {
  if (!Array.isArray(skills) || skills.length === 0) {
    return [];
  }

  const skillMap = new Map(
    skills.map((s) => [s.name.toLowerCase(), s])
  );

  const radarItems = [];
  const added = new Set();

  // 1. Add up to 5 of the student's actual skills (prioritizing verified skills first)
  const sortedSkills = [...skills].sort((a, b) => Number(Boolean(b.verified)) - Number(Boolean(a.verified)));
  for (const sk of sortedSkills.slice(0, 5)) {
    const key = sk.name.toLowerCase();
    if (added.has(key)) continue;
    added.add(key);
    radarItems.push({
      skill: sk.name,
      student: getLevelScore(sk.level, sk.verified),
      market: sk.verified ? 82 : 80,
      fullMark: 100
    });
  }

  // 2. Add up to 2 missing core prerequisites for their target role so real gaps appear
  const roleReqs = getRoleBenchmarks(targetRole);
  let missingAdded = 0;
  for (const req of roleReqs) {
    if (missingAdded >= 2 || radarItems.length >= 7) break;
    const key = req.toLowerCase();
    if (!skillMap.has(key) && !added.has(key)) {
      added.add(key);
      missingAdded += 1;
      radarItems.push({
        skill: req,
        student: 15,
        market: 80,
        fullMark: 100
      });
    }
  }

  return radarItems;
}
