import { Router } from 'express';
import { login, refreshToken, getCurrentUser, registerUser } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication matching API
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/register', registerUser);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       200:
 *         description: Successful login
 */
router.post('/login', login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       200:
 *         description: New access token generated
 */
router.post('/refresh', refreshToken);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Returns current user details
 */
router.get('/me', authenticate, getCurrentUser);

export default router;
