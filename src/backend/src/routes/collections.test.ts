import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../index';
import { getDatabase } from '../utils/database';

describe('Collections API Routes', () => {
  let authToken: string;
  let userId: number;

  beforeEach(async () => {
    // Register and login a test user
    const registerRes = await request(app).post('/api/auth/register').send({
      email: 'test@example.com',
      password: 'TestPass123!',
    });

    userId = registerRes.body.user.id;
    authToken = registerRes.body.token;
  });

  afterEach(() => {
    const db = getDatabase();
    db.prepare('DELETE FROM collection_items').run();
    db.prepare('DELETE FROM collections').run();
    db.prepare('DELETE FROM users').run();
    db.prepare('DELETE FROM sessions').run();
  });

  describe('POST /api/collections', () => {
    it('should create a new collection', async () => {
      const response = await request(app)
        .post('/api/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'My Scientists',
          description: 'Notable scientists',
        })
        .expect(201);

      expect(response.body.collection).toBeDefined();
      expect(response.body.collection.name).toBe('My Scientists');
      expect(response.body.collection.description).toBe('Notable scientists');
      expect(response.body.collection.user_id).toBe(userId);
    });

    it('should require authentication', async () => {
      await request(app)
        .post('/api/collections')
        .send({ name: 'Test' })
        .expect(401);
    });

    it('should require name', async () => {
      const response = await request(app)
        .post('/api/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.error.message).toContain('required');
    });
  });

  describe('GET /api/collections', () => {
    it('should get all collections for authenticated user', async () => {
      // Create test collections
      await request(app)
        .post('/api/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Collection 1' });

      await request(app)
        .post('/api/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Collection 2' });

      const response = await request(app)
        .get('/api/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.collections).toBeDefined();
      expect(response.body.collections.length).toBe(2);
      expect(response.body.count).toBe(2);
    });

    it('should require authentication', async () => {
      await request(app).get('/api/collections').expect(401);
    });
  });

  describe('GET /api/collections/:id', () => {
    it('should get collection by ID', async () => {
      const createRes = await request(app)
        .post('/api/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test Collection' });

      const collectionId = createRes.body.collection.id;

      const response = await request(app)
        .get(`/api/collections/${collectionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.collection).toBeDefined();
      expect(response.body.collection.id).toBe(collectionId);
      expect(response.body.collection.name).toBe('Test Collection');
    });

    it('should return 404 for non-existent collection', async () => {
      await request(app)
        .get('/api/collections/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should require authentication', async () => {
      await request(app).get('/api/collections/1').expect(401);
    });
  });

  describe('PUT /api/collections/:id', () => {
    it('should update collection', async () => {
      const createRes = await request(app)
        .post('/api/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Old Name', description: 'Old' });

      const collectionId = createRes.body.collection.id;

      const response = await request(app)
        .put(`/api/collections/${collectionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'New Name', description: 'New' })
        .expect(200);

      expect(response.body.collection.name).toBe('New Name');
      expect(response.body.collection.description).toBe('New');
    });

    it('should return 404 for non-existent collection', async () => {
      await request(app)
        .put('/api/collections/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test' })
        .expect(404);
    });
  });

  describe('DELETE /api/collections/:id', () => {
    it('should delete collection', async () => {
      const createRes = await request(app)
        .post('/api/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'To Delete' });

      const collectionId = createRes.body.collection.id;

      await request(app)
        .delete(`/api/collections/${collectionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify it's gone
      await request(app)
        .get(`/api/collections/${collectionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('POST /api/collections/:id/items', () => {
    it('should add entity to collection', async () => {
      const createRes = await request(app)
        .post('/api/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Scientists' });

      const collectionId = createRes.body.collection.id;

      const response = await request(app)
        .post(`/api/collections/${collectionId}/items`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          entity_id: 'Q937',
          entity_label: 'Albert Einstein',
          entity_description: 'Theoretical physicist',
        })
        .expect(201);

      expect(response.body.item).toBeDefined();
      expect(response.body.item.entity_id).toBe('Q937');
      expect(response.body.item.entity_label).toBe('Albert Einstein');
    });

    it('should prevent duplicate entities', async () => {
      const createRes = await request(app)
        .post('/api/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Scientists' });

      const collectionId = createRes.body.collection.id;

      // Add once
      await request(app)
        .post(`/api/collections/${collectionId}/items`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ entity_id: 'Q937', entity_label: 'Einstein' });

      // Try to add again
      const response = await request(app)
        .post(`/api/collections/${collectionId}/items`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ entity_id: 'Q937', entity_label: 'Einstein' })
        .expect(409);

      expect(response.body.error.message).toContain('already in collection');
    });
  });

  describe('GET /api/collections/:id/items', () => {
    it('should get all items in collection', async () => {
      const createRes = await request(app)
        .post('/api/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Scientists' });

      const collectionId = createRes.body.collection.id;

      // Add items
      await request(app)
        .post(`/api/collections/${collectionId}/items`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ entity_id: 'Q937', entity_label: 'Einstein' });

      await request(app)
        .post(`/api/collections/${collectionId}/items`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ entity_id: 'Q7186', entity_label: 'Newton' });

      const response = await request(app)
        .get(`/api/collections/${collectionId}/items`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.items.length).toBe(2);
      expect(response.body.count).toBe(2);
    });
  });

  describe('DELETE /api/collections/:id/items/:entityId', () => {
    it('should remove entity from collection', async () => {
      const createRes = await request(app)
        .post('/api/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Scientists' });

      const collectionId = createRes.body.collection.id;

      // Add item
      await request(app)
        .post(`/api/collections/${collectionId}/items`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ entity_id: 'Q937', entity_label: 'Einstein' });

      // Remove item
      await request(app)
        .delete(`/api/collections/${collectionId}/items/Q937`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify it's gone
      const response = await request(app)
        .get(`/api/collections/${collectionId}/items`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.items.length).toBe(0);
    });
  });
});
