import { getDatabase } from '../config/database';
import { financialRecords } from '../db/schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { createLogger } from '../utils/logger';
import { errorFactory } from '../utils/errors';
import { db } from '../db';

const logger = createLogger('FinancialRecordService');

export interface FilterOptions {
  startDate?: Date;
  endDate?: Date;
  category?: string;
  type?: 'income' | 'expense';
  limit?: number;
  offset?: number;
}

export class FinancialRecordService {

  static async getUserRecords(userId: number, filters?: FilterOptions) {
    try {
      const conditions: any[] = [
        eq(financialRecords.userId, userId),
        eq(financialRecords.isDeleted, false),
      ];

      if (filters?.startDate) {
        conditions.push(gte(financialRecords.transactionDate, filters.startDate));
      }
      if (filters?.endDate) {
        conditions.push(lte(financialRecords.transactionDate, filters.endDate));
      }
      if (filters?.category) {
        conditions.push(eq(financialRecords.category, filters.category));
      }
      if (filters?.type) {
        conditions.push(eq(financialRecords.type, filters.type));
      }

      const limit = filters?.limit || 20;
      const offset = filters?.offset || 0;

      const query = db
        .select()
        .from(financialRecords)
        .where(and(...conditions))
        .orderBy(desc(financialRecords.transactionDate))
        .limit(limit)
        .offset(offset);

      return await query;
    } catch (error) {
      logger.error('Failed to fetch records', error, { userId });
      throw errorFactory.serviceUnavailable('Failed to fetch records');
    }
  }

  /**
   * Get record by ID
   */
  static async getRecordById(id: number, userId: number) {
    try {
      const result = await db
        .select()
        .from(financialRecords)
        .where(
          and(eq(financialRecords.id, id), eq(financialRecords.userId, userId), eq(financialRecords.isDeleted, false))
        )
        .limit(1);

      if (!result.length) {
        throw errorFactory.notFound('Record not found');
      }

      return result[0];
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw error;
      }
      logger.error('Failed to fetch record', error, { recordId: id });
      throw errorFactory.serviceUnavailable('Failed to fetch record');
    }
  }

  /**
   * Create new record
   */
  static async createRecord(
    userId: number,
    amount: string,
    type: 'income' | 'expense',
    category: string,
    transactionDate: Date,
    description?: string
  ) {
    try {
      // Validate inputs
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        throw errorFactory.badRequest('Amount must be a positive number');
      }

      if (!['income', 'expense'].includes(type)) {
        throw errorFactory.badRequest("Type must be 'income' or 'expense'");
      }

      if (!category || category.trim().length === 0) {
        throw errorFactory.badRequest('Category is required');
      }

      if (!transactionDate || isNaN(transactionDate.getTime())) {
        throw errorFactory.badRequest('Valid transaction date is required');
      }

      const result = await db
        .insert(financialRecords)
        .values({
          userId,
          amount,
          type,
          category,
          transactionDate,
          description,
        })
        .returning();

      logger.info('Record created', { userId, recordId: result[0].id, type, amount });
      return result[0];
    } catch (error) {
      if (error instanceof Error && error.message.includes('must be')) {
        throw error;
      }
      logger.error('Failed to create record', error, { userId });
      throw errorFactory.serviceUnavailable('Failed to create record');
    }
  }

  /**
   * Update record
   */
  static async updateRecord(
    id: number,
    userId: number,
    updates: {
      amount?: string;
      type?: 'income' | 'expense';
      category?: string;
      description?: string;
      transactionDate?: Date;
    }
  ) {
    try {
      // Verify record exists and belongs to user
      await this.getRecordById(id, userId);

      const updateData: any = {
        updatedAt: new Date(),
      };

      if (updates.amount) {
        if (isNaN(Number(updates.amount)) || Number(updates.amount) <= 0) {
          throw errorFactory.badRequest('Amount must be a positive number');
        }
        updateData.amount = updates.amount;
      }

      if (updates.type) {
        if (!['income', 'expense'].includes(updates.type)) {
          throw errorFactory.badRequest("Type must be 'income' or 'expense'");
        }
        updateData.type = updates.type;
      }

      if (updates.category) {
        updateData.category = updates.category;
      }

      if (updates.description) {
        updateData.description = updates.description;
      }

      if (updates.transactionDate) {
        updateData.transactionDate = updates.transactionDate;
      }

      const result = await db
        .update(financialRecords)
        .set(updateData)
        .where(eq(financialRecords.id, id))
        .returning();

      logger.info('Record updated', { recordId: id, userId });
      return result[0];
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw error;
      }
      logger.error('Failed to update record', error, { recordId: id });
      throw errorFactory.serviceUnavailable('Failed to update record');
    }
  }

  /**
   * Soft delete record
   */
  static async deleteRecord(id: number, userId: number) {
    try {
      await this.getRecordById(id, userId);

      await db
        .update(financialRecords)
        .set({ isDeleted: true, updatedAt: new Date() })
        .where(eq(financialRecords.id, id));

      logger.info('Record deleted', { recordId: id, userId });
      return { success: true };
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw error;
      }
      logger.error('Failed to delete record', error, { recordId: id });
      throw errorFactory.serviceUnavailable('Failed to delete record');
    }
  }

  /**
   * Get total income
   */
  static async getTotalIncome(
    userId: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<number> {
    try {
      const db = getDatabase();

      const conditions = [
        eq(financialRecords.userId, userId),
        eq(financialRecords.type, 'income'),
        eq(financialRecords.isDeleted, false),
      ];

      if (startDate) {
        conditions.push(gte(financialRecords.transactionDate, startDate));
      }
      if (endDate) {
        conditions.push(lte(financialRecords.transactionDate, endDate));
      }

      const result = await db
        .select({
          total: sql<number>`CAST(SUM(${financialRecords.amount}) AS DECIMAL)`,
        })
        .from(financialRecords)
        .where(and(...conditions));

      return Number(result[0]?.total) || 0;
    } catch (error) {
      logger.error('Failed to calculate total income', error);
      throw errorFactory.serviceUnavailable('Failed to calculate total income');
    }
  }

  /**
   * Get total expenses
   */
  static async getTotalExpenses(
    userId: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<number> {
    try {
      const db = getDatabase();

      const conditions = [
        eq(financialRecords.userId, userId),
        eq(financialRecords.type, 'expense'),
        eq(financialRecords.isDeleted, false),
      ];

      if (startDate) {
        conditions.push(gte(financialRecords.transactionDate, startDate));
      }
      if (endDate) {
        conditions.push(lte(financialRecords.transactionDate, endDate));
      }

      const result = await db
        .select({
          total: sql<number>`CAST(SUM(${financialRecords.amount}) AS DECIMAL)`,
        })
        .from(financialRecords)
        .where(and(...conditions));

      return Number(result[0]?.total) || 0;
    } catch (error) {
      logger.error('Failed to calculate total expenses', error);
      throw errorFactory.serviceUnavailable('Failed to calculate total expenses');
    }
  }

  /**
   * Get category breakdown
   */
  static async getCategoryBreakdown(
    userId: number,
    type?: 'income' | 'expense',
    startDate?: Date,
    endDate?: Date
  ) {
    try {
      const db = getDatabase();

      const conditions: any[] = [
        eq(financialRecords.userId, userId),
        eq(financialRecords.isDeleted, false),
      ];

      if (type) {
        conditions.push(eq(financialRecords.type, type));
      }
      if (startDate) {
        conditions.push(gte(financialRecords.transactionDate, startDate));
      }
      if (endDate) {
        conditions.push(lte(financialRecords.transactionDate, endDate));
      }

      const result = await db
        .select({
          category: financialRecords.category,
          total: sql<number>`CAST(SUM(${financialRecords.amount}) AS DECIMAL)`,
          count: sql<number>`COUNT(*)`,
        })
        .from(financialRecords)
        .where(and(...conditions))
        .groupBy(financialRecords.category)
        .orderBy(desc(sql<number>`SUM(${financialRecords.amount})`));

      return result.map((item) => ({
        category: item.category,
        total: Number(item.total),
        count: Number(item.count),
      }));
    } catch (error) {
      logger.error('Failed to get category breakdown', error);
      throw errorFactory.serviceUnavailable('Failed to get category breakdown');
    }
  }
}
