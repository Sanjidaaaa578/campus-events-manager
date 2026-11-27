const request = require('supertest');
const app = require('../../src/app');

describe('Express Application Setup & Healthcheck', () => {
  test('GET /api/health should return 200 with OK status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('message', 'Campus Events Manager API is operational');
    expect(response.body).toHaveProperty('timestamp');
  });

  test('GET /api/unknown-endpoint should return 404 JSON response', async () => {
    const response = await request(app).get('/api/unknown-endpoint');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Not Found');
    expect(response.body.message).toContain('/api/unknown-endpoint');
  });
});
