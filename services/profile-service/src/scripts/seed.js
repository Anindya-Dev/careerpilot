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
    await Profile.deleteMany({ email: 'student@careerpilot.io' });

    const demoProfile = {
      userId: '6630f9a21e4a1a3a12345678',
      name: 'Md Hussain Ansari',
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
          title: 'Expense Tracker Pro',
          description: 'Full-stack MERN application featuring JWT authentication and expense analytics.',
          repo_url: 'https://github.com/ansari/expense-tracker',
          technologies: ['MongoDB', 'Express', 'React', 'Node.js']
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
        github: 'hussain-ansari',
        linkedin: 'linkedin.com/in/hussainansari'
      }
    };

    const profile = new Profile(demoProfile);
    await profile.save();
    console.log(`[Profile Seed] Created profile for: ${profile.name} (Completeness: ${profile.profile_completeness}%)`);
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
