/**
 * Dashboard Service - handles analytics and summary data
 */

import { createLogger } from '../utils/logger';
import { errorFactory } from '../utils/errors';
import { FinancialRecordService } from './financialRecordService';

const logger = createLogger('DashboardService');

export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  categoryBreakdown: Array<{
    category: string;
    total: number;
    count: number;
  }>;
  recentTransactions: Array<any>;
}

export class DashboardService {
  /**
   * Get dashboard summary
   */
  static async getDashboardSummary(userId: number, days: number = 30): Promise<DashboardSummary> {
    try {
      const now = new Date();
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      // Calculate totals
      const totalIncome = await FinancialRecordService.getTotalIncome(
        userId,
        startDate,
        now
      );
      const totalExpenses = await FinancialRecordService.getTotalExpenses(
        userId,
        startDate,
        now
      );

      // Get category breakdown
      const categoryBreakdown = await FinancialRecordService.getCategoryBreakdown(
        userId,
        undefined,
        startDate,
        now
      );

      // Get recent transactions
      const recentTransactions = await FinancialRecordService.getUserRecords(userId, {
        startDate,
        endDate: now,
        limit: 10,
      });

      const netBalance = totalIncome - totalExpenses;

      logger.info('Dashboard summary retrieved', { userId, days });

      return {
        totalIncome,
        totalExpenses,
        netBalance,
        categoryBreakdown,
        recentTransactions,
      };
    } catch (error) {
      logger.error('Failed to get dashboard summary', error, { userId });
      throw errorFactory.serviceUnavailable('Failed to get dashboard summary');
    }
  }

  /**
   * Get income vs expense trend (weekly)
   */
  static async getWeeklyTrend(userId: number, weeks: number = 4) {
    try {
      const trend = [];
      const now = new Date();

      for (let i = weeks - 1; i >= 0; i--) {
        const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
        const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);

        const income = await FinancialRecordService.getTotalIncome(userId, weekStart, weekEnd);
        const expenses = await FinancialRecordService.getTotalExpenses(
          userId,
          weekStart,
          weekEnd
        );

        trend.push({
          week: weekStart.toISOString().split('T')[0],
          income,
          expenses,
          net: income - expenses,
        });
      }

      logger.info('Weekly trend retrieved', { userId });
      return trend;
    } catch (error) {
      logger.error('Failed to get weekly trend', error, { userId });
      throw errorFactory.serviceUnavailable('Failed to get weekly trend');
    }
  }

  /**
   * Get income vs expense trend (monthly)
   */
  static async getMonthlyTrend(userId: number, months: number = 12) {
    try {
      const trend = [];
      const now = new Date();

      for (let i = months - 1; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

        const income = await FinancialRecordService.getTotalIncome(
          userId,
          monthStart,
          monthEnd
        );
        const expenses = await FinancialRecordService.getTotalExpenses(
          userId,
          monthStart,
          monthEnd
        );

        trend.push({
          month: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`,
          income,
          expenses,
          net: income - expenses,
        });
      }

      logger.info('Monthly trend retrieved', { userId });
      return trend;
    } catch (error) {
      logger.error('Failed to get monthly trend', error, { userId });
      throw errorFactory.serviceUnavailable('Failed to get monthly trend');
    }
  }

  /**
   * Get category comparison (income vs expense by category)
   */
  static async getCategoryComparison(userId: number, startDate?: Date, endDate?: Date) {
    try {
      const incomeByCategory = await FinancialRecordService.getCategoryBreakdown(
        userId,
        'income',
        startDate,
        endDate
      );
      const expenseByCategory = await FinancialRecordService.getCategoryBreakdown(
        userId,
        'expense',
        startDate,
        endDate
      );

      const comparison = {
        income: incomeByCategory,
        expenses: expenseByCategory,
      };

      logger.info('Category comparison retrieved', { userId });
      return comparison;
    } catch (error) {
      logger.error('Failed to get category comparison', error, { userId });
      throw errorFactory.serviceUnavailable('Failed to get category comparison');
    }
  }
}
