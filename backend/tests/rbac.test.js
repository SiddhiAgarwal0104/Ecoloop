const request = require('supertest');
const { setup, teardown } = require('../test-helpers/app');
const User = require('../models/User');

let server;

beforeAll(async () => {
  server = await setup();
});

afterAll(async () => {
  await teardown(server);
});

describe('RBAC checks', () => {
  test('NGO cannot create lend item (household only)', async () => {
    // Create NGO user
    const ngo = await User.create({ name: 'Test NGO', email: 'ngo@example.com', password: 'password', role: 'ngo' });
    const household = await User.create({ name: 'Household', email: 'hh@example.com', password: 'password', role: 'household' });

    // Login NGO by generating token directly
    const jwt = require('jsonwebtoken');
    const ngoToken = jwt.sign({ id: ngo._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const res = await request(server)
      .post('/api/lend/create')
      .set('Authorization', `Bearer ${ngoToken}`)
      .send({ title: 'Test Item' });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
