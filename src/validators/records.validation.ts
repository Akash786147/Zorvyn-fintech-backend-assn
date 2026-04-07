import { z } from 'zod';

// Create record schema
const createRecordSchema = z.object({
    userId: z.string().regex(/^\d+$/, 'User ID must be numeric'),
    amount: z
        .number()
        .positive('Amount must be a positive number'),
    type: z.enum(['income', 'expense']),
    category: z
        .string()
        .min(1, 'Category is required')
        .max(50, 'Category must not exceed 50 characters'),
    description: z.string().max(500, 'Description must not exceed 500 characters').optional(),
    transactionDate: z.string().datetime('Invalid date format').optional(),
});

// Update record schema
const updateRecordSchema = z.object({
    amount: z
        .number()
        .positive('Amount must be a positive number')
        .optional(),
    type: z.enum(['income', 'expense']).optional(),
    category: z
        .string()
        .min(1, 'Category is required')
        .max(50, 'Category must not exceed 50 characters')
        .optional(),
    description: z.string().max(500, 'Description must not exceed 500 characters').optional(),
    transactionDate: z.string().datetime('Invalid date format').optional(),
});

// List records schema (query parameters)
const listRecordsSchema = z.object({
    userId: z.string().regex(/^\d+$/).optional(),
    type: z.enum(['income', 'expense']).optional(),
    category: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
});

export const recordValidations = {
    'GET:/records': listRecordsSchema,
    'POST:/records': createRecordSchema,
    'GET:/records/:recordId': z.object({
        recordId: z.string().regex(/^\d+$/, 'Record ID must be numeric'),
    }),
    'PUT:/records/:recordId': z.object({
        recordId: z.string().regex(/^\d+$/, 'Record ID must be numeric'),
    }).merge(updateRecordSchema),
    'DELETE:/records/:recordId': z.object({
        recordId: z.string().regex(/^\d+$/, 'Record ID must be numeric'),
    }),
};

// Dashboard analytics schema
const dashboardAnalyticsSchema = z.object({
    userId: z.string().regex(/^\d+$/).optional(),
    period: z.enum(['weekly', 'monthly', 'yearly']).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
});

export const dashboardValidations = {
    'GET:/dashboard/summary': dashboardAnalyticsSchema,
    'GET:/dashboard/trends/weekly': dashboardAnalyticsSchema,
    'GET:/dashboard/trends/monthly': dashboardAnalyticsSchema,
    'GET:/dashboard/comparison': dashboardAnalyticsSchema,
};
