import { getDatabase } from '../utils/database';
import { createHash } from 'crypto';

const WIKIDATA_API_BASE = 'https://www.wikidata.org/w/api.php';
const DEFAULT_CACHE_HOURS = 24;
const DEFAULT_SEARCH_LIMIT = 10;
const DEFAULT_LANGUAGE = 'en';

export interface WikibaseSearchResult {
  id: string;
  label: string;
  description?: string;
  aliases?: string[];
  match?: {
    type: string;
    text: string;
  };
}

export interface WikibaseEntity {
  id: string;
  type: string;
  labels: Record<string, { language: string; value: string }>;
  descriptions?: Record<string, { language: string; value: string }>;
  aliases?: Record<string, Array<{ language: string; value: string }>>;
  sitelinks?: Record<string, { site: string; title: string; url: string }>;
  statements?: Record<string, unknown>;
}

export class WikibaseService {
  /**
   * Search for entities in Wikibase
   */
  async search(
    query: string,
    limit: number = DEFAULT_SEARCH_LIMIT
  ): Promise<WikibaseSearchResult[]> {
    if (!query || query.trim() === '') {
      return [];
    }

    // Check cache first
    const cached = this.getFromCache(query);
    if (cached) {
      return JSON.parse(cached.results);
    }

    try {
      // Call Wikidata Action API
      const url = new URL(WIKIDATA_API_BASE);
      url.searchParams.set('action', 'wbsearchentities');
      url.searchParams.set('search', query);
      url.searchParams.set('format', 'json');
      url.searchParams.set('language', DEFAULT_LANGUAGE);
      url.searchParams.set('limit', limit.toString());

      const response = await fetch(url.toString());

      if (!response.ok) {
        console.error('Wikibase API error:', response.statusText);
        return [];
      }

      const data = (await response.json()) as any;

      // Transform results to our format (data.search is the array of results)
      const results: WikibaseSearchResult[] = (data.search || []).map(
        (item: any) => ({
          id: item.id,
          label: item.label || item.display?.label?.value || '',
          description:
            item.description || item.display?.description?.value || '',
          aliases: item.aliases || [],
          match: item.match,
        })
      );

      // Cache results
      this.saveToCache(query, results);

      return results;
    } catch (error) {
      console.error('Error fetching from Wikibase:', error);
      return [];
    }
  }

  /**
   * Get entity details by ID
   */
  async getEntity(entityId: string): Promise<WikibaseEntity | null> {
    // Validate entity ID format (Qnnn or Pnnn)
    if (!/^[QP]\d+$/.test(entityId)) {
      throw new Error('Invalid entity ID format');
    }

    // Check cache
    const cacheKey = `entity:${entityId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return JSON.parse(cached.results);
    }

    try {
      // Use Action API for entity details
      const url = new URL(WIKIDATA_API_BASE);
      url.searchParams.set('action', 'wbgetentities');
      url.searchParams.set('ids', entityId);
      url.searchParams.set('format', 'json');
      url.searchParams.set('languages', DEFAULT_LANGUAGE);

      const response = await fetch(url.toString());

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        console.error('Wikibase API error:', response.statusText);
        return null;
      }

      const data = (await response.json()) as any;

      // Extract entity from response (entities[entityId])
      const entity = data.entities?.[entityId];

      if (!entity || entity.missing) {
        return null;
      }

      // Cache entity
      this.saveToCache(cacheKey, entity);

      return entity;
    } catch (error) {
      console.error('Error fetching entity:', error);
      return null;
    }
  }

  /**
   * Get results from cache
   */
  private getFromCache(
    query: string
  ): { results: string; expires_at: string } | undefined {
    const db = getDatabase();

    const cached = db
      .prepare(
        `SELECT results, expires_at
         FROM search_cache
         WHERE query = ?
         AND expires_at > datetime('now')`
      )
      .get(query) as { results: string; expires_at: string } | undefined;

    return cached;
  }

  /**
   * Save results to cache
   */
  private saveToCache(query: string, results: any): void {
    const db = getDatabase();

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + DEFAULT_CACHE_HOURS);

    // Create hash of query for unique constraint
    const queryHash = createHash('sha256')
      .update(query.toLowerCase())
      .digest('hex');

    // Use INSERT OR REPLACE to update existing cache
    db.prepare(
      `INSERT OR REPLACE INTO search_cache (query_hash, query, results, expires_at)
       VALUES (?, ?, ?, ?)`
    ).run(queryHash, query, JSON.stringify(results), expiresAt.toISOString());
  }

  /**
   * Clear expired cache entries
   */
  async clearExpiredCache(): Promise<void> {
    const db = getDatabase();

    db.prepare(
      `DELETE FROM search_cache
       WHERE expires_at <= datetime('now')`
    ).run();
  }
}
