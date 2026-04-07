import { z } from 'zod';

// Create user schema
const createUserSchema = z.object({
    username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(50, 'Username must not exceed 50 characters')
        .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores')
        .toLowerCase(),
    email: z.string().email('Valid email is required').toLowerCase(),
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must not exceed 100 characters'),
    roleName: z.enum(['admin', 'analyst', 'viewer']),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain an uppercase letter')
        .regex(/[a-z]/, 'Password must contain a lowercase letter')
        .regex(/[0-9]/, 'Password must contain a number')
        .optional(),
});

// Update user schema
const updateUserSchema = z.object({
    email: z.string().email('Valid email is required').toLowerCase().optional(),
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must not exceed 100 characters')
        .optional(),
    roleName: z.enum(['admin', 'analyst', 'viewer']).optional(),
});

export const userValidations = {
    'GET:/users': z.object({
        includeInactive: z.boolean().optional(),
    }),
    'POST:/users': createUserSchema,
    'GET:/users/:id': z.object({
        id: z.string().regex(/^\d+$/, 'User ID must be numeric'),
    }),
    'PUT:/users/:id': z.object({
        id: z.string().regex(/^\d+$/, 'User ID must be numeric'),
    }).merge(updateUserSchema),
    'PATCH:/users/:id/deactivate': z.object({
        id: z.string().regex(/^\d+$/, 'User ID must be numeric'),
    }),
};
