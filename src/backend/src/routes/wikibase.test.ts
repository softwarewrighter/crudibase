import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../index';
import { getDatabase } from '../utils/database';

describe('Wikibase API Routes', () => {
  let authToken: string;

  beforeEach(async () => {
    // Register and login a test user to get auth token
    await request(app).post('/api/auth/register').send({
      email: 'test@example.com',
      password: 'TestPass123!',
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'TestPass123!',
    });

    authToken = loginRes.body.token;
  });

  afterEach(() => {
    // Clean up database
    const db = getDatabase();
    db.prepare('DELETE FROM users').run();
    db.prepare('DELETE FROM sessions').run();
    db.prepare('DELETE FROM search_cache').run();
  });

  describe('GET /api/wikibase/search', () => {
    it('should search for entities', async () => {
      const response = await request(app)
        .get('/api/wikibase/search')
        .query({ q: 'Einstein' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('results');
      expect(Array.isArray(response.body.results)).toBe(true);
      expect(response.body.results.length).toBeGreaterThan(0);

      const firstResult = response.body.results[0];
      expect(firstResult).toHaveProperty('id');
      expect(firstResult).toHaveProperty('label');
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/wikibase/search')
        .query({ q: 'Einstein' })
        .expect(401);
    });

    it('should return 400 if query parameter is missing', async () => {
      const response = await request(app)
        .get('/api/wikibase/search')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toContain('required');
    });

    it('should support limit parameter', async () => {
      const response = await request(app)
        .get('/api/wikibase/search')
        .query({ q: 'United States', limit: 3 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.results.length).toBeLessThanOrEqual(3);
    });

    it('should return empty array for no results', async () => {
      const response = await request(app)
        .get('/api/wikibase/search')
        .query({ q: 'xyzabc123nonexistent999' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.results).toEqual([]);
    });
  });

  describe('GET /api/wikibase/entity/:id', () => {
    it('should get entity details by ID', async () => {
      // Q937 is Albert Einstein
      const response = await request(app)
        .get('/api/wikibase/entity/Q937')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('entity');
      expect(response.body.entity.id).toBe('Q937');
      expect(response.body.entity.labels).toBeDefined();
    });

    it('should require authentication', async () => {
      await request(app).get('/api/wikibase/entity/Q937').expect(401);
    });

    it('should return 404 for non-existent entity', async () => {
      await request(app)
        .get('/api/wikibase/entity/Q999999999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 400 for invalid entity ID format', async () => {
      const response = await request(app)
        .get('/api/wikibase/entity/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.error.message).toContain('Invalid entity ID');
    });
  });
});
