/**
 * @file seed.js
 * @description Database seeder script for Phase 1 demo day and viva evaluations.
 * Creates default test students and pre-verified test accounts.
 * @usage npm run seed
 * @author Md Hussain Ansari (Member 1)
 */

const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');

async function seed() {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await connectDB();

    console.log('[Seed] Clearing existing demo accounts...');
    await User.deleteMany({ email: { $in: ['student@careerpilot.io', 'demo@careerpilot.io', 'hussain@engineering.edu'] } });

    console.log('[Seed] Seeding sample student accounts...');
    const students = [
      {
        email: 'student@careerpilot.io',
        passwordHash: 'Password123!',
        name: 'Md Hussain Ansari',
        major: 'Computer Science & Engineering',
        enrollmentYear: 2023,
        isActive: true,
        isEmailVerified: true
      },
      {
        email: 'demo@careerpilot.io',
        passwordHash: 'Password123!',
        name: 'Jane Doe',
        major: 'Artificial Intelligence & Data Science',
        enrollmentYear: 2024,
        isActive: true,
        isEmailVerified: true
      }
    ];

    for (const student of students) {
      const u = new User(student);
      await u.save();
      console.log(`[Seed] Created account: ${student.email} (Password: Password123!)`);
    }

    console.log('[Seed] Database seeding completed successfully.');
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;
