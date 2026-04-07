import { Router } from 'express';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deactivateUser,
} from '../controllers/user.controller';
import { authorize } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     responses:
 *       201:
 *         description: Return newly created user
 */
router.post(
  '/',
  authorize('user', 'create'),
  createUser
);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of all users
 */
router.get('/', authorize('user', 'read'), getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user details by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Return user details
 */
router.get(
  '/:id',
  authorize('user', 'read'),
  getUserById
);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update an existing user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Return updated user
 */
router.put(
  '/:id',
  authorize('user', 'update'),
  updateUser
);

/**
 * @swagger
 * /users/{id}/deactivate:
 *   patch:
 *     summary: Deactivate an existing user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User marked as inactive
 */
router.patch(
  '/:id/deactivate',
  authorize('user', 'delete'),
  deactivateUser
);

export default router;

