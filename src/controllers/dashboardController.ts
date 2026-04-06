import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { successResponse, errorResponse } from '../utils/response';
import { DashboardService } from '../services/dashboardService';

export const getDashboardSummary = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { days = '30' } = req.query;

  if (!userId) {
    res.status(401).json(errorResponse('User not authenticated', req.path));
    return;
  }

  const summary = await DashboardService.getDashboardSummary(userId, parseInt(days as string));

  res.status(200).json(successResponse(summary, req.path, 'Dashboard summary retrieved'));
});

export const getWeeklyTrend = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { weeks = '4' } = req.query;

  if (!userId) {
    res.status(401).json(errorResponse('User not authenticated', req.path));
    return;
  }

  const trend = await DashboardService.getWeeklyTrend(userId, parseInt(weeks as string));

  res.status(200).json(successResponse(trend, req.path, 'Weekly trend retrieved'));
});

export const getMonthlyTrend = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { months = '12' } = req.query;

  if (!userId) {
    res.status(401).json(errorResponse('User not authenticated', req.path));
    return;
  }

  const trend = await DashboardService.getMonthlyTrend(userId, parseInt(months as string));

  res.status(200).json(successResponse(trend, req.path, 'Monthly trend retrieved'));
});

export const getCategoryComparison = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { startDate, endDate } = req.query;

  if (!userId) {
    res.status(401).json(errorResponse('User not authenticated', req.path));
    return;
  }

  const comparison = await DashboardService.getCategoryComparison(
    userId,
    startDate ? new Date(startDate as string) : undefined,
    endDate ? new Date(endDate as string) : undefined
  );

  res.status(200).json(successResponse(comparison, req.path, 'Category comparison retrieved'));
});
