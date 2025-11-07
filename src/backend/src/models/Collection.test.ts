import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Collection } from './Collection';
import { User } from './User';
import { getDatabase } from '../utils/database';

describe('Collection Model', () => {
  let userId: number;

  beforeEach(async () => {
    // Create a test user
    const user = await User.create({
      email: 'test@example.com',
      password: 'TestPass123!',
    });
    userId = user.id;
  });

  afterEach(() => {
    // Clean up
    const db = getDatabase();
    db.prepare('DELETE FROM collection_items').run();
    db.prepare('DELETE FROM collections').run();
    db.prepare('DELETE FROM users').run();
  });

  describe('create', () => {
    it('should create a new collection', async () => {
      const collection = await Collection.create({
        user_id: userId,
        name: 'My Favorite Scientists',
        description: 'A collection of notable scientists',
      });

      expect(collection.id).toBeDefined();
      expect(collection.name).toBe('My Favorite Scientists');
      expect(collection.description).toBe('A collection of notable scientists');
      expect(collection.user_id).toBe(userId);
      expect(collection.created_at).toBeDefined();
    });

    it('should create collection without description', async () => {
      const collection = await Collection.create({
        user_id: userId,
        name: 'Test Collection',
      });

      expect(collection.name).toBe('Test Collection');
      expect(collection.description).toBeNull();
    });

    it('should reject empty name', async () => {
      await expect(
        Collection.create({
          user_id: userId,
          name: '',
        })
      ).rejects.toThrow('Collection name is required');
    });
  });

  describe('findById', () => {
    it('should find collection by id', async () => {
      const created = await Collection.create({
        user_id: userId,
        name: 'Test Collection',
      });

      const found = await Collection.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.name).toBe('Test Collection');
    });

    it('should return null for non-existent collection', async () => {
      const found = await Collection.findById(999999);

      expect(found).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should find all collections for a user', async () => {
      await Collection.create({
        user_id: userId,
        name: 'Collection 1',
      });

      await Collection.create({
        user_id: userId,
        name: 'Collection 2',
      });

      const collections = await Collection.findByUserId(userId);

      expect(collections.length).toBe(2);
      expect(collections.map((c) => c.name)).toContain('Collection 1');
      expect(collections.map((c) => c.name)).toContain('Collection 2');
    });

    it('should return empty array if user has no collections', async () => {
      const collections = await Collection.findByUserId(userId);

      expect(collections).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update collection name and description', async () => {
      const collection = await Collection.create({
        user_id: userId,
        name: 'Old Name',
        description: 'Old description',
      });

      const updated = await Collection.update(collection.id, {
        name: 'New Name',
        description: 'New description',
      });

      expect(updated.name).toBe('New Name');
      expect(updated.description).toBe('New description');
      expect(updated.id).toBe(collection.id);
    });

    it('should throw error for non-existent collection', async () => {
      await expect(Collection.update(999999, { name: 'Test' })).rejects.toThrow(
        'Collection not found'
      );
    });
  });

  describe('delete', () => {
    it('should delete collection', async () => {
      const collection = await Collection.create({
        user_id: userId,
        name: 'To Delete',
      });

      await Collection.delete(collection.id);

      const found = await Collection.findById(collection.id);
      expect(found).toBeNull();
    });

    it('should not throw error for non-existent collection', async () => {
      await expect(Collection.delete(999999)).resolves.not.toThrow();
    });
  });

  describe('addItem', () => {
    it('should add entity to collection', async () => {
      const collection = await Collection.create({
        user_id: userId,
        name: 'Scientists',
      });

      await Collection.addItem(collection.id, {
        entity_id: 'Q937',
        entity_label: 'Albert Einstein',
        entity_description: 'Theoretical physicist',
      });

      const items = await Collection.getItems(collection.id);

      expect(items.length).toBe(1);
      expect(items[0].entity_id).toBe('Q937');
      expect(items[0].entity_label).toBe('Albert Einstein');
    });

    it('should prevent duplicate entities in same collection', async () => {
      const collection = await Collection.create({
        user_id: userId,
        name: 'Scientists',
      });

      await Collection.addItem(collection.id, {
        entity_id: 'Q937',
        entity_label: 'Albert Einstein',
      });

      // Try to add same entity again
      await expect(
        Collection.addItem(collection.id, {
          entity_id: 'Q937',
          entity_label: 'Albert Einstein',
        })
      ).rejects.toThrow('Entity already in collection');
    });
  });

  describe('removeItem', () => {
    it('should remove entity from collection', async () => {
      const collection = await Collection.create({
        user_id: userId,
        name: 'Scientists',
      });

      await Collection.addItem(collection.id, {
        entity_id: 'Q937',
        entity_label: 'Albert Einstein',
      });

      await Collection.removeItem(collection.id, 'Q937');

      const items = await Collection.getItems(collection.id);
      expect(items.length).toBe(0);
    });
  });

  describe('getItems', () => {
    it('should get all items in collection', async () => {
      const collection = await Collection.create({
        user_id: userId,
        name: 'Scientists',
      });

      await Collection.addItem(collection.id, {
        entity_id: 'Q937',
        entity_label: 'Albert Einstein',
      });

      await Collection.addItem(collection.id, {
        entity_id: 'Q7186',
        entity_label: 'Isaac Newton',
      });

      const items = await Collection.getItems(collection.id);

      expect(items.length).toBe(2);
      expect(items.map((i) => i.entity_label)).toContain('Albert Einstein');
      expect(items.map((i) => i.entity_label)).toContain('Isaac Newton');
    });

    it('should return empty array for collection with no items', async () => {
      const collection = await Collection.create({
        user_id: userId,
        name: 'Empty Collection',
      });

      const items = await Collection.getItems(collection.id);

      expect(items).toEqual([]);
    });
  });
});
