const request = require('supertest');
const { setup, teardown } = require('../test-helpers/app');
const User = require('../models/User');
const LendItem = require('../models/LendItem');
const BorrowRequest = require('../models/BorrowRequest');
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');

let server;
let ownerToken, requesterToken, owner, requester, item;

beforeAll(async () => {
  server = await setup();
  owner = await User.create({ name: 'Owner', email: 'owner@example.com', password: 'password', role: 'household', address: { locality: 'L1', pincode: '560001' } });
  requester = await User.create({ name: 'Requester', email: 'req@example.com', password: 'password', role: 'household', address: { locality: 'L1', pincode: '560001' } });
  ownerToken = jwt.sign({ id: owner._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  requesterToken = jwt.sign({ id: requester._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  item = await LendItem.create({ owner: owner._id, title: 'Lamp', listingType: 'donate', quantity: 1 });
});

afterAll(async () => {
  await teardown(server);
});

test('Create request sends notification to owner', async () => {
  const res = await request(server)
    .post('/api/requests/create')
    .set('Authorization', `Bearer ${requesterToken}`)
    .send({ itemId: item._id, requestType: 'donate', quantityRequested: 1 });

  expect(res.statusCode).toBe(201);

  const notes = await Notification.find({ user: owner._id });
  expect(notes.length).toBeGreaterThan(0);
  expect(notes[0].title).toMatch(/New request/);
});

test('Accept request notifies requester', async () => {
  const r = await BorrowRequest.findOne({ item: item._id, requester: requester._id });
  const res = await request(server)
    .put(`/api/requests/${r._id}/accept`)
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ acceptanceNote: 'Will pick up' });

  expect(res.statusCode).toBe(200);

  const notes = await Notification.find({ user: requester._id });
  expect(notes.length).toBeGreaterThan(0);
  expect(notes.some(n => /accepted/i.test(n.title) || /accepted/i.test(n.message))).toBeTruthy();
});
