/**
 * Financial Record schema - stores transaction/entry data
 */

import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
  numeric,
  text,
  boolean,
} from 'drizzle-orm/pg-core';

export type FinancialRecordType = 'income' | 'expense';

export const financialRecords = pgTable('financial_records', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'income' or 'expense'
  category: varchar('category', { length: 100 }).notNull(),
  description: text('description'),
  transactionDate: timestamp('transaction_date').notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type FinancialRecord = typeof financialRecords.$inferSelect;
export type NewFinancialRecord = typeof financialRecords.$inferInsert;
