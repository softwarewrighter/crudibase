import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/index';

describe('Health Check', () => {
  it('should return 200 OK with status information', async () => {
    const response = await request(app).get('/health').expect(200);

    expect(response.body as Record<string, unknown>).toHaveProperty(
      'status',
      'ok'
    );
    expect(response.body as Record<string, unknown>).toHaveProperty(
      'timestamp'
    );
    expect(response.body as Record<string, unknown>).toHaveProperty(
      'environment'
    );
  });

  it('should return API information at /api', async () => {
    const response = await request(app).get('/api').expect(200);

    expect(response.body as Record<string, unknown>).toHaveProperty(
      'message',
      'Crudibase API'
    );
    expect(response.body as Record<string, unknown>).toHaveProperty('version');
    expect(response.body as Record<string, unknown>).toHaveProperty(
      'endpoints'
    );
  });

  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/unknown-route').expect(404);

    expect((response.body as Record<string, unknown>).error).toHaveProperty(
      'code',
      'NOT_FOUND'
    );
  });
});
