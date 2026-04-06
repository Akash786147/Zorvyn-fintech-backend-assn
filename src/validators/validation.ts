import { z } from 'zod';

export const createUserSchema = z.object({
    body: z.object({
        username: z
            .string()
            .min(3, 'Username must be at least 3 characters')
            .max(50, 'Username must not exceed 50 characters')
            .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain alphanumeric, underscore, and dash'),
        email: z.string().email('Invalid email format'),
        name: z
            .string()
            .min(2, 'Name must be at least 2 characters')
            .max(100, 'Name must not exceed 100 characters'),
        roleName: z.enum(['viewer', 'analyst', 'admin'] as const),
    }),
});

export const updateUserSchema = z.object({
    body: z.object({
        name: z
            .string()
            .min(2, 'Name must be at least 2 characters')
            .max(100, 'Name must not exceed 100 characters')
            .optional(),
        email: z.string().email('Invalid email format').optional(),
        isActive: z.boolean().optional(),
        roleName: z.enum(['viewer', 'analyst', 'admin'] as const).optional(),
    }),
    params: z.object({
        id: z.string().regex(/^\d+$/, 'ID must be a number'),
    }),
});

export const getUserByIdSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, 'ID must be a number'),
    }),
});

export const deactivateUserSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, 'ID must be a number'),
    }),
});

/**
 * Financial Record Schemas
 */
export const createRecordSchema = z.object({
    body: z.object({
        amount: z
            .number()
            .positive('Amount must be a positive number')
            .finite('Amount must be a valid number'),
        type: z.enum(['income', 'expense'] as const),
        category: z
            .string()
            .min(2, 'Category must be at least 2 characters')
            .max(50, 'Category must not exceed 50 characters'),
        description: z
            .string()
            .max(500, 'Description must not exceed 500 characters')
            .optional(),
        transactionDate: z
            .string()
            .datetime('Invalid date format, must be ISO 8601')
            .transform((val) => new Date(val)),
    }),
});

export const updateRecordSchema = z.object({
    body: z.object({
        amount: z.number().positive('Amount must be a positive number').optional(),
        type: z.enum(['income', 'expense']).optional(),
        category: z
            .string()
            .min(2, 'Category must be at least 2 characters')
            .max(50, 'Category must not exceed 50 characters')
            .optional(),
        description: z.string().max(500, 'Description must not exceed 500 characters').optional(),
        transactionDate: z
            .string()
            .datetime('Invalid date format, must be ISO 8601')
            .transform((val) => new Date(val))
            .optional(),
    }),
    params: z.object({
        id: z.string().regex(/^\d+$/, 'ID must be a number'),
    }),
});

export const getRecordSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, 'ID must be a number'),
    }),
});

export const deleteRecordSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, 'ID must be a number'),
    }),
});

export const getUserRecordsSchema = z.object({
    query: z.object({
        startDate: z
            .string()
            .datetime('Invalid start date format')
            .transform((val) => new Date(val))
            .optional(),
        endDate: z
            .string()
            .datetime('Invalid end date format')
            .transform((val) => new Date(val))
            .optional(),
        category: z.string().max(50, 'Category filter too long').optional(),
        type: z.enum(['income', 'expense']).optional(),
        limit: z
            .string()
            .regex(/^\d+$/, 'Limit must be a number')
            .transform(Number)
            .refine((n) => n > 0 && n <= 100, 'Limit must be between 1 and 100')
            .optional(),
        offset: z
            .string()
            .regex(/^\d+$/, 'Offset must be a number')
            .transform(Number)
            .refine((n) => n >= 0, 'Offset must be non-negative')
            .optional(),
    }),
});

/**
 * Dashboard Schemas
 */
export const getDashboardSummarySchema = z.object({
    query: z.object({
        days: z
            .string()
            .regex(/^\d+$/, 'Days must be a number')
            .transform(Number)
            .refine((n) => n > 0, 'Days must be positive')
            .optional(),
    }),
});

export const getWeeklyTrendSchema = z.object({
    query: z.object({
        weeks: z
            .string()
            .regex(/^\d+$/, 'Weeks must be a number')
            .transform(Number)
            .refine((n) => n > 0, 'Weeks must be positive')
            .optional(),
    }),
});

export const getMonthlyTrendSchema = z.object({
    query: z.object({
        months: z
            .string()
            .regex(/^\d+$/, 'Months must be a number')
            .transform(Number)
            .refine((n) => n > 0, 'Months must be positive')
            .optional(),
    }),
});

export const getCategoryComparisonSchema = z.object({
    query: z.object({
        startDate: z.string().datetime('Invalid start date format').optional(),
        endDate: z.string().datetime('Invalid end date format').optional(),
    }),
});

/**
 * Export all schemas as a map for dynamic access
 */
export const validationSchemas = {
    // User routes
    createUser: createUserSchema,
    updateUser: updateUserSchema,
    getUserById: getUserByIdSchema,
    deactivateUser: deactivateUserSchema,

    // Record routes
    createRecord: createRecordSchema,
    updateRecord: updateRecordSchema,
    getRecord: getRecordSchema,
    deleteRecord: deleteRecordSchema,
    getUserRecords: getUserRecordsSchema,

    // Dashboard routes
    getDashboardSummary: getDashboardSummarySchema,
    getWeeklyTrend: getWeeklyTrendSchema,
    getMonthlyTrend: getMonthlyTrendSchema,
    getCategoryComparison: getCategoryComparisonSchema,
};

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateRecordInput = z.infer<typeof createRecordSchema>;
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>;
