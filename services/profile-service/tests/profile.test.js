/**
 * @file profile.test.js
 * @description Integration tests for Profile Microservice using Jest, Supertest, and MongoMemoryServer.
 * @author Md Hussain Ansari (Member 1)
 */

const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const Profile = require('../src/models/Profile');
const { JWT_ACCESS_SECRET, INTERNAL_SERVICE_KEY } = require('../src/config/env');

let mongoServer;
let validToken;
const testUserId = '6630f9a21e4a1a3a12345678';
const testUser = {
  userId: testUserId,
  email: 'teststudent@careerpilot.io',
  name: 'Test Student',
  major: 'Information Technology'
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  validToken = jwt.sign(testUser, JWT_ACCESS_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

describe('Health and Readiness Probes', () => {
  test('GET /health returns 200 with service info', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('profile-service');
  });

  test('GET /ready returns 200 when database connected', async () => {
    const res = await request(app).get('/ready');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ready');
  });
});

describe('GET /api/v1/profile/me', () => {
  test('Returns 200 and auto-initializes profile on first visit', async () => {
    const res = await request(app)
      .get('/api/v1/profile/me')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.profile.userId).toBe(testUserId);
    expect(res.body.profile.name).toBe(testUser.name);
    expect(res.body.profile.email).toBe(testUser.email);
    expect(res.body.profile.major).toBe(testUser.major);
  });

  test('Returns 401 when Authorization header is missing', async () => {
    const res = await request(app).get('/api/v1/profile/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});

describe('PUT /api/v1/profile/me', () => {
  test('Updates skills, target role, projects and calculates completeness score', async () => {
    const payload = {
      target_role: 'AI Engineer',
      skills: [
        { name: 'Python', level: 'advanced', category: 'Languages', verified: true },
        { name: 'PyTorch', level: 'intermediate', category: 'Frameworks', verified: false }
      ],
      goals: ['Publish NLP Research Paper', 'Crack FAANG Internship'],
      projects: [
        {
          title: 'CareerPilot AI',
          description: 'Multi-agent career intelligence platform',
          repo_url: 'https://github.com/Anindya-Dev/careerpilot',
          technologies: ['Node.js', 'Python', 'Neo4j']
        }
      ],
      certifications: [
        { name: 'Deep Learning Specialization', issuer: 'Coursera', issue_date: '2025-05' }
      ],
      linked_accounts: {
        github: 'hussain-ansari',
        linkedin: 'linkedin.com/in/hussainansari'
      }
    };

    const res = await request(app)
      .put('/api/v1/profile/me')
      .set('Authorization', `Bearer ${validToken}`)
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.profile.target_role).toBe('AI Engineer');
    expect(res.body.profile.skills.length).toBe(2);
    expect(res.body.profile.skills[0].name).toBe('Python');
    expect(res.body.profile.projects.length).toBe(1);
    expect(res.body.profile.linked_accounts.github).toBe('hussain-ansari');
    expect(res.body.profile.profile_completeness).toBeGreaterThanOrEqual(80);
  });
});

describe('GET /api/v1/profile/:userId (Agent Ingestion)', () => {
  beforeEach(async () => {
    await Profile.create({
      userId: 'user_agent_123',
      name: 'Agent Ingestion User',
      email: 'agent@careerpilot.io',
      target_role: 'Data Scientist',
      skills: [{ name: 'SQL', level: 'expert', category: 'Databases', verified: true }]
    });
  });

  test('Orchestrator fetches profile using internal service key', async () => {
    const res = await request(app)
      .get('/api/v1/profile/user_agent_123')
      .set('x-internal-key', INTERNAL_SERVICE_KEY);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.profile.userId).toBe('user_agent_123');
    expect(res.body.profile.target_role).toBe('Data Scientist');
  });

  test('Returns 404 for unknown user id', async () => {
    const res = await request(app)
      .get('/api/v1/profile/non_existent_id')
      .set('x-internal-key', INTERNAL_SERVICE_KEY);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('PROFILE_NOT_FOUND');
  });
});
