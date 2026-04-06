import { Router } from 'express';
import {
  getDashboardSummary,
  getWeeklyTrend,
  getMonthlyTrend,
  getCategoryComparison,
} from '../controllers/dashboardController';
import { authenticate, authorize } from '../middleware/auth';
import { validateAll } from '../middleware/validator';
import {
  getDashboardSummarySchema,
  getWeeklyTrendSchema,
  getMonthlyTrendSchema,
  getCategoryComparisonSchema,
} from '../validators/validation';

const router = Router();

/**
 * Dashboard and Analytics Routes
 * Base path: /api/v1/dashboard
 * Permission: dashboard:read (all authenticated users)
 */

/**
 * GET /api/v1/dashboard/summary
 * Get dashboard summary with current metrics
 * Query params:
 *   - days: number of days to look back (default 30)
 * Returns: income, expenses, balance, top categories, recent transactions
 * Permission: dashboard:read (viewer, analyst, admin)
 */
router.get('/summary', authenticate, authorize('dashboard', 'read'), validateAll(getDashboardSummarySchema), getDashboardSummary);

/**
 * GET /api/v1/dashboard/trends/weekly
 * Get weekly trend data for charting
 * Query params:
 *   - weeks: number of weeks to include (default 12)
 * Returns: array of week summaries with income, expenses, net
 * Permission: dashboard:read (viewer, analyst, admin)
 */
router.get('/trends/weekly', authenticate, authorize('dashboard', 'read'), validateAll(getWeeklyTrendSchema), getWeeklyTrend);

/**
 * GET /api/v1/dashboard/trends/monthly
 * Get monthly trend data for long-term analysis
 * Query params:
 *   - months: number of months to include (default 12)
 * Returns: array of month summaries with income, expenses, net
 * Permission: dashboard:read (viewer, analyst, admin)
 */
router.get('/trends/monthly', authenticate, authorize('dashboard', 'read'), validateAll(getMonthlyTrendSchema), getMonthlyTrend);

/**
 * GET /api/v1/dashboard/comparison
 * Get category comparison data
 * Query params:
 *   - startDate: ISO date string (default: 30 days ago)
 *   - endDate: ISO date string (default: today)
 * Returns: separate income and expense breakdown by category
 * Permission: dashboard:read (viewer, analyst, admin)
 */
router.get('/comparison', authenticate, authorize('dashboard', 'read'), validateAll(getCategoryComparisonSchema), getCategoryComparison);

export default router;
