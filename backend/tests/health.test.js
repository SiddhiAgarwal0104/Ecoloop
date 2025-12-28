const request = require('supertest');
const { setup, teardown } = require('../test-helpers/app');

let server;

beforeAll(async () => {
  server = await setup();
});

afterAll(async () => {
  await teardown(server);
});

test('GET /health returns 200', async () => {
  const res = await request(server).get('/health');
  expect(res.statusCode).toBe(200);
  expect(res.body.ok || res.body.success).toBeTruthy();
});
