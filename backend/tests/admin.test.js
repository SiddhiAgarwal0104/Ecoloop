const request = require('supertest');
const { setup, teardown } = require('../test-helpers/app');
const User = require('../models/User');
const WasteLog = require('../models/WasteLog');
const LendItem = require('../models/LendItem');
const jwt = require('jsonwebtoken');

let server;
let adminToken;

beforeAll(async () => {
  server = await setup();
  const admin = await User.create({ name: 'Admin', email: 'admin@example.com', password: 'password', role: 'admin' });
  adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // seed some waste and lend items
  await WasteLog.create({ user: admin._id, category: 'plastic', quantity: { value: 5 }, wasteDate: new Date() });
  await WasteLog.create({ user: admin._id, category: 'paper', quantity: { value: 3 }, wasteDate: new Date() });
  await LendItem.create({ owner: admin._id, title: 'Chair', listingType: 'donate', quantity: 1 });
  await LendItem.create({ owner: admin._id, title: 'Table', listingType: 'lend', quantity: 1 });
});

afterAll(async () => {
  await teardown(server);
});

test('Admin analytics returns aggregated data', async () => {
  const res = await request(server)
    .get('/api/admin/analytics')
    .set('Authorization', `Bearer ${adminToken}`);

  expect(res.statusCode).toBe(200);
  expect(res.body.success).toBe(true);
  expect(res.body.data.totalWeightKg).toBeGreaterThan(0);
  expect(Array.isArray(res.body.data.category)).toBe(true);
});
