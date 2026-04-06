import { Router } from 'express';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deactivateUser,
  getAllRoles,
} from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';
import { validateAll } from '../middleware/validator';
import {
  createUserSchema,
  updateUserSchema,
  getUserByIdSchema,
  deactivateUserSchema,
} from '../validators/validation';

const router = Router();

/**
 * User Management Routes
 * Base path: /api/v1/users
 */

/**
 * POST /api/v1/users
 * Create a new user
 * Permission: user:create (admin only)
 */
router.post(
  '/',
  authenticate,
  authorize('user', 'create'),
  validateAll(createUserSchema),
  createUser
);

/**
 * GET /api/v1/users
 * Get all users
 * Query: inactive=true (to include inactive users)
 * Permission: user:read (admin only)
 */
router.get('/', authenticate, authorize('user', 'read'), getAllUsers);

/**
 * GET /api/v1/users/:id
 * Get a specific user by ID
 * Permission: user:read
 */
router.get(
  '/:id',
  authenticate,
  authorize('user', 'read'),
  validateAll(getUserByIdSchema),
  getUserById
);

/**
 * PUT /api/v1/users/:id
 * Update a user
 * Permission: user:update
 */
router.put(
  '/:id',
  authenticate,
  authorize('user', 'update'),
  validateAll(updateUserSchema),
  updateUser
);

/**
 * PATCH /api/v1/users/:id/deactivate
 * Deactivate a user
 * Permission: user:delete (admin only)
 */
router.patch(
  '/:id/deactivate',
  authenticate,
  authorize('user', 'delete'),
  validateAll(deactivateUserSchema),
  deactivateUser
);

/**
 * GET /api/v1/users/roles/all
 * Get all available roles
 * Permission: None (all authenticated users)
 */
router.get('/roles/all', authenticate, getAllRoles);

export default router;

