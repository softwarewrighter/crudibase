import { getDatabase } from '../utils/database';

export interface CollectionData {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CollectionItemData {
  id: number;
  collection_id: number;
  entity_id: string;
  entity_label: string;
  entity_description: string | null;
  added_at: string;
}

export interface CreateCollectionInput {
  user_id: number;
  name: string;
  description?: string;
}

export interface UpdateCollectionInput {
  name?: string;
  description?: string;
}

export interface AddItemInput {
  entity_id: string;
  entity_label: string;
  entity_description?: string;
}

export class Collection {
  /**
   * Create a new collection
   */
  static async create(input: CreateCollectionInput): Promise<CollectionData> {
    const { user_id, name, description } = input;

    // Validate
    if (!name || name.trim() === '') {
      throw new Error('Collection name is required');
    }

    const db = getDatabase();

    const result = db
      .prepare(
        `INSERT INTO collections (user_id, name, description)
         VALUES (?, ?, ?)`
      )
      .run(user_id, name.trim(), description || null);

    const collection = db
      .prepare('SELECT * FROM collections WHERE id = ?')
      .get(result.lastInsertRowid) as CollectionData;

    return collection;
  }

  /**
   * Find collection by ID
   */
  static async findById(id: number): Promise<CollectionData | null> {
    const db = getDatabase();

    const collection = db
      .prepare('SELECT * FROM collections WHERE id = ?')
      .get(id) as CollectionData | undefined;

    return collection || null;
  }

  /**
   * Find all collections for a user
   */
  static async findByUserId(userId: number): Promise<CollectionData[]> {
    const db = getDatabase();

    const collections = db
      .prepare(
        'SELECT * FROM collections WHERE user_id = ? ORDER BY created_at DESC'
      )
      .all(userId) as CollectionData[];

    return collections;
  }

  /**
   * Update collection
   */
  static async update(
    id: number,
    input: UpdateCollectionInput
  ): Promise<CollectionData> {
    const db = getDatabase();

    // Check if collection exists
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error('Collection not found');
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (input.name !== undefined) {
      updates.push('name = ?');
      values.push(input.name.trim());
    }

    if (input.description !== undefined) {
      updates.push('description = ?');
      values.push(input.description);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');

    values.push(id);

    db.prepare(
      `UPDATE collections
       SET ${updates.join(', ')}
       WHERE id = ?`
    ).run(...values);

    const updated = await this.findById(id);
    return updated!;
  }

  /**
   * Delete collection
   */
  static async delete(id: number): Promise<void> {
    const db = getDatabase();

    // Delete collection (items will be cascade deleted)
    db.prepare('DELETE FROM collections WHERE id = ?').run(id);
  }

  /**
   * Add entity to collection
   */
  static async addItem(
    collectionId: number,
    input: AddItemInput
  ): Promise<CollectionItemData> {
    const db = getDatabase();

    // Check if entity already in collection
    const existing = db
      .prepare(
        'SELECT id FROM collection_items WHERE collection_id = ? AND entity_id = ?'
      )
      .get(collectionId, input.entity_id);

    if (existing) {
      throw new Error('Entity already in collection');
    }

    const result = db
      .prepare(
        `INSERT INTO collection_items (collection_id, entity_id, entity_label, entity_description)
         VALUES (?, ?, ?, ?)`
      )
      .run(
        collectionId,
        input.entity_id,
        input.entity_label,
        input.entity_description || null
      );

    const item = db
      .prepare('SELECT * FROM collection_items WHERE id = ?')
      .get(result.lastInsertRowid) as CollectionItemData;

    return item;
  }

  /**
   * Remove entity from collection
   */
  static async removeItem(
    collectionId: number,
    entityId: string
  ): Promise<void> {
    const db = getDatabase();

    db.prepare(
      'DELETE FROM collection_items WHERE collection_id = ? AND entity_id = ?'
    ).run(collectionId, entityId);
  }

  /**
   * Get all items in collection
   */
  static async getItems(collectionId: number): Promise<CollectionItemData[]> {
    const db = getDatabase();

    const items = db
      .prepare(
        'SELECT * FROM collection_items WHERE collection_id = ? ORDER BY added_at DESC'
      )
      .all(collectionId) as CollectionItemData[];

    return items;
  }
}
