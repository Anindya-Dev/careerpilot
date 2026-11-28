/**
 * @file seed.js
 * @description Profile database seeder for demo day and local integration tests.
 * @usage npm run seed
 * @author Md Hussain Ansari (Member 1)
 */

const { connectDB, disconnectDB } = require('../config/db');
const Profile = require('../models/Profile');

async function seed() {
  try {
    console.log('[Profile Seed] Connecting to MongoDB...');
    await connectDB();

    console.log('[Profile Seed] Seeding demo profile...');
    await Profile.deleteMany({
      $or: [
        { email: 'student@careerpilot.io' },
        { email: 'demo@careerpilot.io' },
        { userId: 'demo-student-id-001' }
      ]
    });

    const demoProfile = {
      userId: '6630f9a21e4a1a3a12345678',
      name: 'Alex Rivera',
      email: 'student@careerpilot.io',
      major: 'Computer Science & Engineering',
      target_role: 'AI / Machine Learning Engineer',
      skills: [
        { name: 'Python', level: 'advanced', category: 'Languages', verified: true, source: 'github' },
        { name: 'PyTorch', level: 'intermediate', category: 'Frameworks', verified: true, source: 'github' },
        { name: 'Node.js', level: 'advanced', category: 'Frameworks', verified: true, source: 'github' },
        { name: 'React', level: 'advanced', category: 'Frameworks', verified: false, source: 'self-reported' },
        { name: 'Docker', level: 'intermediate', category: 'DevOps & Cloud', verified: false, source: 'self-reported' }
      ],
      goals: [
        'Crack Top-Tier ML / AI Engineering Role',
        'Publish Graph Neural Networks Research Paper',
        'Contribute to Open Source LLM Frameworks'
      ],
      projects: [
        {
          title: 'CareerPilot AI',
          description: 'Multi-agent AI career intelligence & graph-based roadmap platform.',
          repo_url: 'https://github.com/Anindya-Dev/careerpilot',
          technologies: ['Node.js', 'Express', 'React', 'MongoDB', 'Python', 'Neo4j']
        },
        {
          title: 'Distributed Systems Key-Value Store',
          description: 'Raft consensus key-value store built in Go with automated cluster failover.',
          repo_url: 'https://github.com/example/raft-kv',
          technologies: ['Go', 'Raft', 'gRPC', 'Docker']
        }
      ],
      certifications: [
        {
          name: 'Deep Learning Specialization',
          issuer: 'DeepLearning.AI',
          issue_date: '2025-06'
        }
      ],
      career_health_score: 84.5,
      linked_accounts: {
        github: 'alex-rivera-dev',
        linkedin: 'linkedin.com/in/alexrivera',
        leetcode: 'alexrivera'
      },
      github_data: {
        profile: {
          username: 'alex-rivera-dev',
          name: 'Alex Rivera',
          bio: 'AI & Full Stack Engineer passionate about autonomous agent swarms.',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          public_repos: 14,
          total_stars: 32,
          followers: 48,
          html_url: 'https://github.com/alex-rivera-dev'
        },
        repositories: [
          {
            id: 101,
            name: 'careerpilot',
            html_url: 'https://github.com/Anindya-Dev/careerpilot',
            description: 'Autonomous Multi-Agent Career Intelligence & Graph Architecture Platform',
            language: 'TypeScript',
            stars: 18,
            forks: 4,
            topics: ['agents', 'multi-agent', 'career-intelligence', 'fastapi', 'react']
          },
          {
            id: 102,
            name: 'distributed-raft-kv',
            html_url: 'https://github.com/example/raft-kv',
            description: 'Fault-tolerant distributed key-value store using Raft consensus in Go',
            language: 'Go',
            stars: 9,
            forks: 2,
            topics: ['distributed-systems', 'raft', 'grpc']
          },
          {
            id: 103,
            name: 'neural-graph-evaluator',
            html_url: 'https://github.com/example/neural-graph-evaluator',
            description: 'PyTorch Graph Neural Network pipeline for knowledge graph inference',
            language: 'Python',
            stars: 5,
            forks: 1,
            topics: ['pytorch', 'gnn', 'machine-learning']
          }
        ],
        code_audit: {
          skills_detected_from_code: 6,
          scanned_repos: ['careerpilot', 'distributed-raft-kv', 'neural-graph-evaluator'],
          files_scanned_count: 28,
          repo_logs: [
            { repo: 'careerpilot', detected: ['TypeScript', 'React', 'Node.js', 'FastAPI'] },
            { repo: 'distributed-raft-kv', detected: ['Go', 'gRPC', 'Docker'] },
            { repo: 'neural-graph-evaluator', detected: ['Python', 'PyTorch'] }
          ]
        },
        detected_skills: [
          { name: 'Python', level: 'advanced', category: 'Languages', verified: true, source: 'github' },
          { name: 'TypeScript', level: 'advanced', category: 'Languages', verified: true, source: 'github' },
          { name: 'React', level: 'advanced', category: 'Frameworks', verified: true, source: 'github' },
          { name: 'PyTorch', level: 'intermediate', category: 'Frameworks', verified: true, source: 'github' }
        ],
        audit_log: [
          { msg: '✓ GitHub profile loaded — 14 repos found (0.4s)', status: 'done', ts: '10:50:00' },
          { msg: '✓ Language scan complete — 4 languages detected', status: 'done', ts: '10:50:01' },
          { msg: '✓ Deep code & semantic audit complete — 6 skills verified across 3 repos (28 files)', status: 'done', ts: '10:50:02' },
          { msg: '✓ Profile saved — GitHub audit complete', status: 'done', ts: '10:50:03' }
        ],
        audited_at: new Date().toISOString()
      },
      leetcode_data: {
        username: 'alexrivera',
        ranking: 42150,
        stats: {
          total: 284,
          easy: 110,
          medium: 142,
          hard: 32
        },
        dsa_standard: {
          score: 82,
          status: 'strong',
          label: 'Competitive DSA Baseline'
        },
        suggestions: [
          'Practice Graph BFS/DFS dynamic programming transition problems',
          'Target Monotonic Stack and Trie optimization questions'
        ]
      }
    };

    const profile = new Profile(demoProfile);
    await profile.save();

    // Also seed identical profile under demo-student-id-001 so Demo Sandbox sees it immediately
    const sandboxProfile = new Profile({
      ...demoProfile,
      userId: 'demo-student-id-001',
      email: 'demo@careerpilot.io'
    });
    await sandboxProfile.save();
    console.log(`[Profile Seed] Created profiles for: ${profile.name} & Demo Sandbox (Completeness: ${profile.profile_completeness}%)`);
  } catch (error) {
    console.error('[Profile Seed] Error during seeding:', error);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;
