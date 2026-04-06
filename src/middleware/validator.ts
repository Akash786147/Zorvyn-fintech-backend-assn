/**
 * Validation middleware using Zod
 * Validates request body, params, and query
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { errorFactory } from '@utils/errors';
import { createLogger } from '@utils/logger';

const logger = createLogger('validation');

/**
 * Validation result interface
 */
export interface ValidationResult {
    success: boolean;
    data?: Record<string, any>;
    errors?: Array<{
        path: string;
        message: string;
    }>;
}

/**
 * Format Zod errors into readable messages
 */
const formatZodErrors = (error: z.ZodError<any>): ValidationResult['errors'] => {
    return error.issues.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
    }));
};

/**
 * Create a validation middleware for a specific schema
 * @param schema - Zod schema to validate against
 * @param dataSource - Which part of request to validate: 'body', 'params', 'query', or 'all'
 */
export const validate = (schema: ZodSchema, dataSource: 'body' | 'params' | 'query' | 'all' = 'body') => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            let dataToValidate: Record<string, any> = {};

            switch (dataSource) {
                case 'body':
                    dataToValidate = { body: req.body };
                    break;
                case 'params':
                    dataToValidate = { params: req.params };
                    break;
                case 'query':
                    dataToValidate = { query: req.query };
                    break;
                case 'all':
                    dataToValidate = {
                        body: req.body || {},
                        params: req.params || {},
                        query: req.query || {},
                    };
                    break;
            }

            // Validate using Zod
            const result = await schema.parseAsync(dataToValidate);

            // Store validated data in request for controllers
            (req as any).validated = result;

            // Also merge validated data back for convenience
            if (result && typeof result === 'object') {
                const resObj = result as Record<string, any>;
                if (resObj.body) req.body = resObj.body;
                if (resObj.params) req.params = resObj.params;
                if (resObj.query) req.query = resObj.query;
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errors = formatZodErrors(error);

                logger.warn('Validation failed', {
                    path: req.path,
                    method: req.method,
                    errors,
                });

                // Generate user-friendly error message
                const errorMessage = errors?.map((e) => `${e.path}: ${e.message}`).join('; ') || 'Validation failed';

                return next(
                    errorFactory.badRequest(`Validation failed: ${errorMessage}`)
                );
            }

            logger.error('Unexpected validation error', error as Error);
            next(errorFactory.badRequest('Invalid request data'));
        }
    };
};

/**
 * Simpler version: validates only body
 */
export const validateBody = (schema: ZodSchema) => validate(schema, 'body');

/**
 * Validates body + params + query
 */
export const validateAll = (schema: ZodSchema) => validate(schema, 'all');

/**
 * Inline validation function (for use in controllers if needed)
 * Returns { success, data, errors }
 */
export const validateData = async (schema: ZodSchema, data: any): Promise<ValidationResult> => {
    try {
        const result = await schema.parseAsync(data);
        return {
            success: true,
            data: (result as Record<string, any>) || {},
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                errors: formatZodErrors(error) || [],
            };
        }
        return {
            success: false,
            errors: [{ path: 'unknown', message: 'Validation failed' }],
        };
    }
};

/**
 * Helper to create combined schema validators
 * Validates body + params in one call
 */
export const createCombinedValidator = (bodySchema: ZodSchema, paramsSchema?: ZodSchema) => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const dataToValidate: Record<string, any> = {
                body: req.body || {},
            };

            if (paramsSchema) {
                dataToValidate.params = req.params || {};
            }

            let combined: ZodSchema;
            if (paramsSchema) {
                combined = z.object({
                    body: bodySchema,
                    params: paramsSchema,
                });
            } else {
                combined = z.object({
                    body: bodySchema,
                });
            }

            const result = await combined.parseAsync(dataToValidate);

            (req as any).validated = result;
            if (result && typeof result === 'object') {
                const resObj = result as Record<string, any>;
                if (resObj.body) req.body = resObj.body;
                if (resObj.params) req.params = resObj.params;
            }

            logger.debug('Combined validation passed', {
                path: req.path,
                method: req.method,
            });

            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errors = formatZodErrors(error);
                logger.warn('Combined validation failed', { errors });
                return next(
                    errorFactory.badRequest(
                        `Validation failed: ${errors?.map((e) => `${e.path}: ${e.message}`).join('; ') || 'Unknown error'}`
                    )
                );
            }
            next(errorFactory.badRequest('Invalid request data'));
        }
    };
};
