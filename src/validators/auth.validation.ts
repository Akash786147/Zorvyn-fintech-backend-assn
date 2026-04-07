import { z } from 'zod';

const loginSchema = z.object({
    username: z
        .string()
        .min(1, 'Username is required')
        .toLowerCase()
        .optional(),
    email: z
        .string()
        .email('Valid email is required')
        .toLowerCase()
        .optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
}).refine(
    (data) => data.username || data.email,
    { message: 'Either username or email is required', path: ['username'] }
);

// Register schema
const registerSchema = z.object({
    username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(50, 'Username must not exceed 50 characters')
        .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores')
        .toLowerCase(),
    email: z.string().email('Valid email is required').toLowerCase(),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain an uppercase letter')
        .regex(/[a-z]/, 'Password must contain a lowercase letter')
        .regex(/[0-9]/, 'Password must contain a number')
        .regex(/[!@#$%^&*]/, 'Password must contain a special character (!@#$%^&*)'),
    confirmPassword: z.string(),
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must not exceed 100 characters'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

// Refresh token schema
const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const authValidations = {
    'GET:/auth/me': z.object({}),
    'POST:/auth/login': loginSchema,
    'POST:/auth/register': registerSchema,
    'POST:/auth/refresh': refreshTokenSchema,
    'POST:/auth/logout': z.object({}),
};
