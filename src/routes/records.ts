import { Router } from 'express';
import {
  createRecord,
  getUserRecords,
  getRecord,
  updateRecord,
  deleteRecord,
} from '../controllers/recordController';
import { authenticate, authorize, authorizeOwnership } from '../middleware/auth';
import { validateAll } from '../middleware/validator';
import {
  createRecordSchema,
  updateRecordSchema,
  getRecordSchema,
  deleteRecordSchema,
  getUserRecordsSchema,
} from '../validators/validation';

const router = Router();

/**
 * Financial Records Routes
 * Base path: /api/v1/records
 * Permission: record:* for analyst/admin
 */

/**
 * POST /api/v1/records
 * Create a new financial record
 * Permission: record:create (analyst, admin only)
 */
router.post(
  '/',
  authenticate,
  authorize('record', 'create'),
  validateAll(createRecordSchema),
  createRecord
);

/**
 * GET /api/v1/records
 * Get user's financial records with filtering
 * Query params:
 *   - startDate: ISO date string
 *   - endDate: ISO date string
 *   - category: filter by category
 *   - type: 'income' or 'expense'
 *   - limit: pagination limit (default 20)
 *   - offset: pagination offset (default 0)
 * Permission: record:read (analyst, admin)
 */
router.get(
  '/',
  authenticate,
  authorize('record', 'read'),
  validateAll(getUserRecordsSchema),
  getUserRecords
);

/**
 * GET /api/v1/records/:id
 * Get a specific financial record by ID
 * Permission: record:read + ownership check
 */
router.get(
  '/:id',
  authenticate,
  authorize('record', 'read'),
  validateAll(getRecordSchema),
  authorizeOwnership('record', 'userId'),
  getRecord
);

/**
 * PUT /api/v1/records/:id
 * Update a financial record
 * Permission: record:update + ownership check
 */
router.put(
  '/:id',
  authenticate,
  authorize('record', 'update'),
  validateAll(updateRecordSchema),
  authorizeOwnership('record', 'userId'),
  updateRecord
);

/**
 * DELETE /api/v1/records/:id
 * Delete (soft delete) a financial record
 * Permission: record:delete + ownership check
 */
router.delete(
  '/:id',
  authenticate,
  authorize('record', 'delete'),
  validateAll(deleteRecordSchema),
  authorizeOwnership('record', 'userId'),
  deleteRecord
);

export default router;
