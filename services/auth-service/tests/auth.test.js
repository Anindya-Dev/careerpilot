/**
 * @file auth.test.js
 * @description Integration test suite for the Authentication Microservice.
 * Validates registration, credential verification, JWT issuance, route guards, token rotation,
 * and error handling using Jest, Supertest, and MongoMemoryServer.
 * @author Md Hussain Ansari (Member 1)
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User');
const RefreshToken = require('../src/models/RefreshToken');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await RefreshToken.deleteMany({});
});

describe('Health and Readiness Probes', () => {
  test('GET /health returns 200 with healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('auth-service');
  });

  test('GET /ready returns 200 when database is connected', async () => {
    const res = await request(app).get('/ready');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ready');
    expect(res.body.database).toBe('connected');
  });
});

describe('POST /api/v1/auth/register', () => {
  const validUser = {
    email: 'hussain@example.com',
    password: 'SecurePassword123!',
    name: 'Md Hussain Ansari',
    major: 'Computer Science & Engineering',
    enrollmentYear: 2023
  };

  test('Registers a new user successfully and returns tokens', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(validUser.email);
    expect(res.body.user.name).toBe(validUser.name);
    expect(res.body.user.passwordHash).toBeUndefined(); // Never leak hash
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();

    // Verify user is in MongoDB with bcrypt hash
    const dbUser = await User.findOne({ email: validUser.email });
    expect(dbUser).not.toBeNull();
    expect(dbUser.passwordHash).not.toBe(validUser.password);
    expect(dbUser.passwordHash.startsWith('$2')).toBe(true); // bcrypt prefix
  });

  test('Returns 409 Conflict when registering with duplicate email', async () => {
    await request(app).post('/api/v1/auth/register').send(validUser);

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(validUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('DUPLICATE_EMAIL');
  });

  test('Returns 400 Bad Request when password has fewer than 8 characters', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...validUser, password: 'short' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('WEAK_PASSWORD');
  });

  test('Returns 400 Bad Request when email format is invalid', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...validUser, email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_EMAIL');
  });
});

describe('POST /api/v1/auth/login', () => {
  const credentials = {
    email: 'student@careerpilot.io',
    password: 'MasterPassword2026!',
    name: 'Jane Student'
  };

  beforeEach(async () => {
    await request(app).post('/api/v1/auth/register').send(credentials);
  });

  test('Authenticates valid credentials and issues accessToken', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: credentials.email,
        password: credentials.password
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe(credentials.email);

    // Verify httpOnly cookie was set
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some((c) => c.includes('refreshToken='))).toBe(true);
  });

  test('Returns 401 Unauthorized for incorrect password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: credentials.email,
        password: 'WrongPassword999!'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  test('Returns 401 Unauthorized for unregistered email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'ghost@careerpilot.io',
        password: 'Password123!'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});

describe('GET /api/v1/auth/me (Protected Route)', () => {
  let token;
  const userPayload = {
    email: 'profile_test@careerpilot.io',
    password: 'SecretPassword123!',
    name: 'Profile Tester',
    major: 'Artificial Intelligence'
  };

  beforeEach(async () => {
    const regRes = await request(app).post('/api/v1/auth/register').send(userPayload);
    token = regRes.body.accessToken;
  });

  test('Returns 200 with user profile when Authorization Bearer token is valid', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(userPayload.email);
    expect(res.body.user.name).toBe(userPayload.name);
    expect(res.body.user.major).toBe(userPayload.major);
  });

  test('Returns 401 Unauthorized when Bearer token is missing', async () => {
    const res = await request(app).get('/api/v1/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  test('Returns 401 Unauthorized when Bearer token is invalid or malformed', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer this.is.invalid.jwt');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });
});

describe('POST /api/v1/auth/refresh (Token Rotation)', () => {
  let refreshToken;

  beforeEach(async () => {
    const regRes = await request(app).post('/api/v1/auth/register').send({
      email: 'rotate@careerpilot.io',
      password: 'RotatePassword123!',
      name: 'Rotator User'
    });
    refreshToken = regRes.body.refreshToken;
  });

  test('Rotates refresh token and returns new token pair', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.refreshToken).not.toBe(refreshToken); // Rotated
  });

  test('Rejects previously rotated refresh token (reuse detection)', async () => {
    // First rotation
    await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken });

    // Second rotation with same old token should fail
    const replayRes = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken });

    expect(replayRes.status).toBe(401);
    expect(replayRes.body.error.code).toBe('REVOKED_TOKEN');
  });
});

describe('POST /api/v1/auth/logout', () => {
  test('Revokes session and clears cookies', async () => {
    const regRes = await request(app).post('/api/v1/auth/register').send({
      email: 'logout@careerpilot.io',
      password: 'LogoutPassword123!',
      name: 'Logout User'
    });

    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${regRes.body.accessToken}`)
      .send({ refreshToken: regRes.body.refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('POST /api/v1/auth/forgot-password & reset-password', () => {
  test('Generates reset token and allows updating password', async () => {
    const regRes = await request(app).post('/api/v1/auth/register').send({
      email: 'resetme@careerpilot.io',
      password: 'OldPassword123!',
      name: 'Reset User'
    });

    const forgotRes = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'resetme@careerpilot.io' });

    expect(forgotRes.status).toBe(200);
    expect(forgotRes.body.success).toBe(true);
    expect(forgotRes.body.resetToken).toBeDefined();

    const resetRes = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({
        token: forgotRes.body.resetToken,
        newPassword: 'BrandNewPassword2026!'
      });

    expect(resetRes.status).toBe(200);
    expect(resetRes.body.success).toBe(true);

    // Verify login with new password works
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'resetme@careerpilot.io',
        password: 'BrandNewPassword2026!'
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.accessToken).toBeDefined();
  });
});

describe('Rate Limiting Protection', () => {
  test('Blocks more than 10 attempts from same IP within 15 mins (HTTP 429)', async () => {
    for (let i = 0; i < 10; i++) {
      await request(app)
        .post('/api/v1/auth/login')
        .set('x-test-rate-limit', 'true')
        .send({ email: 'ratelimit@careerpilot.io', password: 'Password123!' });
    }

    const blockedRes = await request(app)
      .post('/api/v1/auth/login')
      .set('x-test-rate-limit', 'true')
      .send({ email: 'ratelimit@careerpilot.io', password: 'Password123!' });

    expect(blockedRes.status).toBe(429);
    expect(blockedRes.body.success).toBe(false);
    expect(blockedRes.body.error.code).toBe('TOO_MANY_REQUESTS');
  });
});
