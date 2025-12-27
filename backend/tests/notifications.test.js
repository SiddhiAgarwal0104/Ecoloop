// tests/notifications.test.js
const request = require('supertest');
const app = require('../test-helpers/app');

let server;

beforeAll(async () => {
  server = await app.setup();
});

afterAll(async () => {
  await app.teardown(server);
});

describe('Notifications', () => {
  test('Fetch notifications for user', async () => {
    // Seed a user and a notification via seed script or direct POST
    const email = `test.user${Date.now()}@test.local`;
    const phone = '9' + Math.floor(100000000 + Math.random() * 899999999).toString();
    const reg = await request(server)
      .post('/api/auth/register')
      .send({ name: 'Notify User', email, password: 'password123', phone })
      .expect(201);

    const token = reg.body.token;

    // Create a notification as admin would (skip admin, use direct model in seed normally). For simplicity we just call GET and expect empty array
    const res = await request(server)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});