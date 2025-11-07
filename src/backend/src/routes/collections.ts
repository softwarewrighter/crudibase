import { Router, Response } from 'express';
import { Collection } from '../models/Collection';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

export const collectionsRouter = Router();

// Apply authentication middleware to all collection routes
collectionsRouter.use(authenticate);

// Validation schemas
const createCollectionSchema = z.object({
  name: z.string().min(1, 'Collection name is required'),
  description: z.string().optional(),
});

const updateCollectionSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

const addItemSchema = z.object({
  entity_id: z.string().min(1, 'Entity ID is required'),
  entity_label: z.string().min(1, 'Entity label is required'),
  entity_description: z.string().optional(),
});

/**
 * POST /api/collections
 * Create a new collection
 */
collectionsRouter.post(
  '/',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const validation = createCollectionSchema.safeParse(req.body);

      if (!validation.success) {
        const firstError = validation.error.errors[0];
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: firstError.message,
            field: firstError.path[0],
          },
        });
        return;
      }

      const collection = await Collection.create({
        user_id: req.userId!,
        name: validation.data.name,
        description: validation.data.description,
      });

      res.status(201).json({ collection });
    } catch (error) {
      console.error('Create collection error:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred creating collection',
        },
      });
    }
  }
);

/**
 * GET /api/collections
 * Get all collections for authenticated user
 */
collectionsRouter.get(
  '/',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const collections = await Collection.findByUserId(req.userId!);

      res.status(200).json({
        collections,
        count: collections.length,
      });
    } catch (error) {
      console.error('Get collections error:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred fetching collections',
        },
      });
    }
  }
);

/**
 * GET /api/collections/:id
 * Get collection by ID
 */
collectionsRouter.get(
  '/:id',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid collection ID',
          },
        });
        return;
      }

      const collection = await Collection.findById(id);

      if (!collection) {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Collection not found',
          },
        });
        return;
      }

      // Verify ownership
      if (collection.user_id !== req.userId) {
        res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied',
          },
        });
        return;
      }

      res.status(200).json({ collection });
    } catch (error) {
      console.error('Get collection error:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred fetching collection',
        },
      });
    }
  }
);

/**
 * PUT /api/collections/:id
 * Update collection
 */
collectionsRouter.put(
  '/:id',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid collection ID',
          },
        });
        return;
      }

      const validation = updateCollectionSchema.safeParse(req.body);

      if (!validation.success) {
        const firstError = validation.error.errors[0];
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: firstError.message,
            field: firstError.path[0],
          },
        });
        return;
      }

      // Check ownership
      const existing = await Collection.findById(id);
      if (!existing) {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Collection not found',
          },
        });
        return;
      }

      if (existing.user_id !== req.userId) {
        res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied',
          },
        });
        return;
      }

      const collection = await Collection.update(id, validation.data);

      res.status(200).json({ collection });
    } catch (error) {
      console.error('Update collection error:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred updating collection',
        },
      });
    }
  }
);

/**
 * DELETE /api/collections/:id
 * Delete collection
 */
collectionsRouter.delete(
  '/:id',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid collection ID',
          },
        });
        return;
      }

      // Check ownership
      const existing = await Collection.findById(id);
      if (!existing) {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Collection not found',
          },
        });
        return;
      }

      if (existing.user_id !== req.userId) {
        res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied',
          },
        });
        return;
      }

      await Collection.delete(id);

      res.status(200).json({
        message: 'Collection deleted successfully',
      });
    } catch (error) {
      console.error('Delete collection error:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred deleting collection',
        },
      });
    }
  }
);

/**
 * POST /api/collections/:id/items
 * Add entity to collection
 */
collectionsRouter.post(
  '/:id/items',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid collection ID',
          },
        });
        return;
      }

      const validation = addItemSchema.safeParse(req.body);

      if (!validation.success) {
        const firstError = validation.error.errors[0];
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: firstError.message,
            field: firstError.path[0],
          },
        });
        return;
      }

      // Check ownership
      const collection = await Collection.findById(id);
      if (!collection) {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Collection not found',
          },
        });
        return;
      }

      if (collection.user_id !== req.userId) {
        res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied',
          },
        });
        return;
      }

      const item = await Collection.addItem(id, validation.data);

      res.status(201).json({ item });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Entity already in collection'
      ) {
        res.status(409).json({
          error: {
            code: 'CONFLICT',
            message: error.message,
          },
        });
        return;
      }

      console.error('Add item error:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred adding item',
        },
      });
    }
  }
);

/**
 * GET /api/collections/:id/items
 * Get all items in collection
 */
collectionsRouter.get(
  '/:id/items',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid collection ID',
          },
        });
        return;
      }

      // Check ownership
      const collection = await Collection.findById(id);
      if (!collection) {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Collection not found',
          },
        });
        return;
      }

      if (collection.user_id !== req.userId) {
        res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied',
          },
        });
        return;
      }

      const items = await Collection.getItems(id);

      res.status(200).json({
        items,
        count: items.length,
      });
    } catch (error) {
      console.error('Get items error:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred fetching items',
        },
      });
    }
  }
);

/**
 * DELETE /api/collections/:id/items/:entityId
 * Remove entity from collection
 */
collectionsRouter.delete(
  '/:id/items/:entityId',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const entityId = req.params.entityId;

      if (isNaN(id)) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid collection ID',
          },
        });
        return;
      }

      // Check ownership
      const collection = await Collection.findById(id);
      if (!collection) {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Collection not found',
          },
        });
        return;
      }

      if (collection.user_id !== req.userId) {
        res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied',
          },
        });
        return;
      }

      await Collection.removeItem(id, entityId);

      res.status(200).json({
        message: 'Item removed successfully',
      });
    } catch (error) {
      console.error('Remove item error:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred removing item',
        },
      });
    }
  }
);
