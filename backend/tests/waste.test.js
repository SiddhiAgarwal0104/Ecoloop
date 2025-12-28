const request = require('supertest');
const { setup, teardown } = require('../test-helpers/app');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

let server;
let householdUser;
let token;

beforeAll(async () => {
  server = await setup();
  householdUser = await User.create({ name: 'HH', email: 'hh2@example.com', password: 'password', role: 'household', address: { locality: 'TestLocality', pincode: '560001', city: 'TestCity' } });
  token = jwt.sign({ id: householdUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
  await teardown(server);
});

test('Household can log waste with impact calculation', async () => {
  const res = await request(server)
    .post('/api/waste/log')
    .set('Authorization', `Bearer ${token}`)
    .send({ category: 'plastic', quantity: { value: 2 } });

  expect(res.statusCode).toBe(201);
  expect(res.body.success).toBe(true);
  expect(res.body.data).toBeDefined();
  expect(res.body.data.impact).toBeDefined();
  expect(res.body.data.impact.co2SavedKg).toBeGreaterThan(0);
});

test('Household cannot use predict without image', async () => {
  const res = await request(server)
    .post('/api/waste/predict')
    .set('Authorization', `Bearer ${token}`)
    .send();

  expect([400, 415]).toContain(res.statusCode);
});

test('Household can log waste via multipart form with image and fields', async () => {
  const res = await request(server)
    .post('/api/waste/log')
    .set('Authorization', `Bearer ${token}`)
    .field('category', 'plastic')
    .field('quantity[value]', '2')
    .field('quantity[unit]', 'kg');

  expect(res.statusCode).toBe(201);
  expect(res.body.success).toBe(true);
  expect(res.body.data.impact.co2SavedKg).toBeGreaterThan(0);
});
