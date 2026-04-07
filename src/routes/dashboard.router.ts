import { Router } from 'express';
import {
  getDashboardSummary,
  getWeeklyTrend,
  getMonthlyTrend,
  getCategoryComparison,
} from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Analytics and overview API
 */

/**
 * @swagger
 * /dashboard/summary:
 *   get:
 *     summary: Get dashboard metrics
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Dashboard summary fetched
 */
router.get('/summary', authenticate, authorize('dashboard', 'read'), getDashboardSummary);

/**
 * @swagger
 * /dashboard/trends/weekly:
 *   get:
 *     summary: Chart data for weekly trends
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Weekly aggregates fetched
 */
router.get('/trends/weekly', authenticate, authorize('dashboard', 'read'), getWeeklyTrend);

/**
 * @swagger
 * /dashboard/trends/monthly:
 *   get:
 *     summary: Chart data for monthly trends
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Monthly averages fetched
 */
router.get('/trends/monthly', authenticate, authorize('dashboard', 'read'), getMonthlyTrend);

/**
 * @swagger
 * /dashboard/comparison:
 *   get:
 *     summary: Category comparative analysis
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Comparison categories returned
 */
router.get('/comparison', authenticate, authorize('dashboard', 'read'), getCategoryComparison);

export default router;
