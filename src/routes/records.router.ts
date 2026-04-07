import { Router } from 'express';
import {
  createRecord,
  getUserRecords,
  getRecord,
  updateRecord,
  deleteRecord,
} from '../controllers/record.controller';
import { authenticate, authorize, authorizeOwnership } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Records
 *   description: Financial records matching API
 */

/**
 * @swagger
 * /records:
 *   post:
 *     summary: Create financial record
 *     tags: [Records]
 *     responses:
 *       201:
 *         description: Successfully created
 */
router.post(
  '/',
  authenticate,
  authorize('record', 'create'),
  createRecord
);

/**
 * @swagger
 * /records:
 *   get:
 *     summary: Get user financial records
 *     tags: [Records]
 *     responses:
 *       200:
 *         description: Paginated records
 */
router.get(
  '/',
  authenticate,
  authorize('record', 'read'),
  getUserRecords
);

/**
 * @swagger
 * /records/{id}:
 *   get:
 *     summary: Get single record by ID
 *     tags: [Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns record
 */
router.get(
  '/:id',
  authenticate,
  authorize('record', 'read'),
  authorizeOwnership('record', 'userId'),
  getRecord
);

/**
 * @swagger
 * /records/{id}:
 *   put:
 *     summary: Update an existing record
 *     tags: [Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Updated record
 */
router.put(
  '/:id',
  authenticate,
  authorize('record', 'update'),
  authorizeOwnership('record', 'userId'),
  updateRecord
);

/**
 * @swagger
 * /records/{id}:
 *   delete:
 *     summary: Soft delete a record
 *     tags: [Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted flag true
 */
router.delete(
  '/:id',
  authenticate,
  authorize('record', 'delete'),
  authorizeOwnership('record', 'userId'),
  deleteRecord
);

export default router;
