// tests/auth.test.js
const request = require('supertest');
const app = require('../test-helpers/app');
const mongoose = require('mongoose');

let server;

beforeAll(async () => {
  server = await app.setup();
});

afterAll(async () => {
  await app.teardown(server);
});

describe('Auth endpoints', () => {
  test('Register and login workflow', async () => {
    const email = `test.user${Date.now()}@test.local`;
    const registerRes = await request(server)
      .post('/api/auth/register')
      .send({ name: 'Jest User', email, password: 'password123' })
      .expect(201);

    expect(registerRes.body.success).toBe(true);
    expect(registerRes.body.token).toBeDefined();

    const loginRes = await request(server)
      .post('/api/auth/login')
      .send({ emailOrPhone: email, password: 'password123' })
      .expect(200);

    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.token).toBeDefined();
  });
});