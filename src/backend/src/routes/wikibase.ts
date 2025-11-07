import { Router, Response } from 'express';
import { WikibaseService } from '../services/WikibaseService';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

export const wikibaseRouter = Router();
const wikibaseService = new WikibaseService();

// Apply authentication middleware to all wikibase routes
wikibaseRouter.use(authenticate);

// Validation schema for search
const searchSchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  limit: z.coerce.number().min(1).max(50).optional(),
});

/**
 * GET /api/wikibase/search
 * Search for entities in Wikibase
 */
wikibaseRouter.get(
  '/search',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Validate query parameters
      const validation = searchSchema.safeParse(req.query);

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

      const { q, limit } = validation.data;

      // Search entities
      const results = await wikibaseService.search(q, limit);

      res.status(200).json({
        results,
        query: q,
        count: results.length,
      });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred during search',
        },
      });
    }
  }
);

/**
 * GET /api/wikibase/entity/:id
 * Get entity details by ID
 */
wikibaseRouter.get(
  '/entity/:id',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Get entity details
      const entity = await wikibaseService.getEntity(id);

      if (!entity) {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: `Entity ${id} not found`,
          },
        });
        return;
      }

      res.status(200).json({
        entity,
      });
    } catch (error) {
      // Handle validation errors
      if (
        error instanceof Error &&
        error.message.includes('Invalid entity ID')
      ) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
          },
        });
        return;
      }

      console.error('Entity fetch error:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred fetching entity',
        },
      });
    }
  }
);
