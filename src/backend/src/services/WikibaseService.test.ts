import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WikibaseService } from './WikibaseService';
import { getDatabase } from '../utils/database';

describe('WikibaseService', () => {
  let wikibaseService: WikibaseService;

  beforeEach(() => {
    wikibaseService = new WikibaseService();
  });

  afterEach(() => {
    // Clear cache after each test
    const db = getDatabase();
    db.prepare('DELETE FROM search_cache').run();
  });

  describe('search', () => {
    it('should search for entities and return results', async () => {
      const results = await wikibaseService.search('Einstein');

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);

      // Check result structure
      const firstResult = results[0];
      expect(firstResult).toHaveProperty('id');
      expect(firstResult).toHaveProperty('label');
      expect(firstResult).toHaveProperty('description');
    });

    it('should return empty array for no results', async () => {
      const results = await wikibaseService.search(
        'xyzabc123nonexistentterm999'
      );

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    it('should cache search results', async () => {
      const query = 'Einstein';

      // First search - should hit API
      const results1 = await wikibaseService.search(query);

      // Check cache
      const db = getDatabase();
      const cached = db
        .prepare('SELECT * FROM search_cache WHERE query = ?')
        .get(query);

      expect(cached).toBeDefined();

      // Second search - should use cache
      const results2 = await wikibaseService.search(query);

      expect(results2).toEqual(results1);
    });

    it('should respect cache expiration', async () => {
      const query = 'Einstein';

      // First search
      await wikibaseService.search(query);

      // Manually expire the cache
      const db = getDatabase();
      db.prepare(
        `UPDATE search_cache
         SET expires_at = datetime('now', '-1 hour')
         WHERE query = ?`
      ).run(query);

      // Second search should hit API again (not use expired cache)
      const results = await wikibaseService.search(query);
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle API errors gracefully', async () => {
      // Test with invalid query or network error simulation
      // For now, we'll just ensure it doesn't crash
      await expect(wikibaseService.search('')).resolves.toEqual([]);
    });

    it('should limit results to specified number', async () => {
      const results = await wikibaseService.search('United States', 5);

      expect(results.length).toBeLessThanOrEqual(5);
    });
  });

  describe('getEntity', () => {
    it('should fetch entity details by ID', async () => {
      // Q937 is Albert Einstein in Wikidata
      const entity = await wikibaseService.getEntity('Q937');

      expect(entity).toBeDefined();
      expect(entity!.id).toBe('Q937');
      expect(entity!.labels).toBeDefined();
      expect(entity!.labels.en).toBeDefined();
      expect(entity!.labels.en.value).toContain('Einstein');
    });

    it('should return null for non-existent entity', async () => {
      const entity = await wikibaseService.getEntity('Q999999999999');

      expect(entity).toBeNull();
    });

    it('should cache entity details', async () => {
      const entityId = 'Q937';

      // First fetch
      const entity1 = await wikibaseService.getEntity(entityId);

      // Check cache (using search_cache table for entities too)
      const db = getDatabase();
      const cached = db
        .prepare('SELECT * FROM search_cache WHERE query = ?')
        .get(`entity:${entityId}`);

      expect(cached).toBeDefined();

      // Second fetch should use cache
      const entity2 = await wikibaseService.getEntity(entityId);

      expect(entity2).toEqual(entity1);
    });

    it('should handle invalid entity ID format', async () => {
      await expect(wikibaseService.getEntity('invalid-id')).rejects.toThrow(
        'Invalid entity ID format'
      );
    });
  });

  describe('cache management', () => {
    it('should clear expired cache entries', async () => {
      const db = getDatabase();

      // Insert expired cache entry
      db.prepare(
        `INSERT INTO search_cache (query, results, expires_at)
         VALUES (?, ?, datetime('now', '-2 hours'))`
      ).run('old-query', JSON.stringify([]));

      // Insert valid cache entry
      db.prepare(
        `INSERT INTO search_cache (query, results, expires_at)
         VALUES (?, ?, datetime('now', '+1 hour'))`
      ).run('new-query', JSON.stringify([]));

      // Clear expired entries
      await wikibaseService.clearExpiredCache();

      // Check that only valid entry remains
      const oldCache = db
        .prepare('SELECT * FROM search_cache WHERE query = ?')
        .get('old-query');
      const newCache = db
        .prepare('SELECT * FROM search_cache WHERE query = ?')
        .get('new-query');

      expect(oldCache).toBeUndefined();
      expect(newCache).toBeDefined();
    });
  });
});
