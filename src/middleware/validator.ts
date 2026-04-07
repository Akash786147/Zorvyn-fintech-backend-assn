import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { createLogger } from '../utils/logger';

const logger = createLogger('validation');

/**
 * Validation result interface
 */
export interface ValidationResult {
    success: boolean;
    data?: Record<string, any>;
    errors?: Record<string, string[]>;
}

/**
 * Format Zod error messages in a user-friendly way
 */
const formatZodErrors = (error: z.ZodError<any>): Record<string, string[]> => {
    const formatted: Record<string, string[]> = {};

    error.issues.forEach((issue: any) => {
        const path = issue.path.join('.');
        if (!formatted[path]) {
            formatted[path] = [];
        }
        formatted[path].push(issue.message);
    });

    return formatted;
};

/**
 * Validate data against a Zod schema
 */
export const validateData = async (
    data: any,
    schema: ZodSchema
): Promise<ValidationResult> => {
    try {
        const result = await schema.safeParseAsync(data);

        if (!result.success) {
            return {
                success: false,
                errors: formatZodErrors(result.error),
            };
        }

        return {
            success: true,
            data: result.data as Record<string, any>,
        };
    } catch (err: any) {
        logger.error('Validation error:', err);
        return {
            success: false,
            errors: { validation: [err.message || 'Unknown validation error'] },
        };
    }
};

/**
 * Main validation middleware factory
 */
export const validate = (
    schema: ZodSchema,
    dataSource: 'body' | 'query' | 'params' | 'bodyAndParams' = 'body'
) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            let data = {};

            if (dataSource === 'body') {
                data = req.body;
            } else if (dataSource === 'query') {
                data = req.query;
            } else if (dataSource === 'params') {
                data = req.params;
            } else if (dataSource === 'bodyAndParams') {
                data = { ...req.body, ...req.params };
            }

            const result = await validateData(data, schema);

            if (!result.success) {
                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: result.errors,
                });
                return;
            }

            // Merge validated data back into appropriate source
            if (dataSource === 'body') {
                req.body = result.data;
            } else if (dataSource === 'query') {
                req.query = result.data as any;
            } else if (dataSource === 'params') {
                req.params = result.data as any;
            } else if (dataSource === 'bodyAndParams') {
                req.body = result.data;
                req.params = result.data as any;
            }

            next();
        } catch (err: any) {
            logger.error('Validation middleware error:', err);
            res.status(500).json({
                success: false,
                message: 'Internal validation error',
            });
        }
    };
};

/**
 * Validate request body
 */
export const validateBody = (schema: ZodSchema) => {
    return validate(schema, 'body');
};

/**
 * Validate request query parameters
 */
export const validateQuery = (schema: ZodSchema) => {
    return validate(schema, 'query');
};

/**
 * Validate request URL parameters
 */
export const validateParams = (schema: ZodSchema) => {
    return validate(schema, 'params');
};

/**
 * Validate both body and URL parameters
 */
export const validateBodyAndParams = (schema: ZodSchema) => {
    return validate(schema, 'bodyAndParams');
};

/**
 * Find schema key and parse params based on req.path
 */
const findSchemaAndParams = (method: string, reqPath: string, schemas: Record<string, ZodSchema>) => {
    const exactKey = `${method}:${reqPath}`;
    if (schemas[exactKey]) return { key: exactKey, parsedParams: {} };

    for (const key of Object.keys(schemas)) {
        if (!key.startsWith(`${method}:`)) continue;
        const routePattern = key.substring(method.length + 1);

        // Replace URL params like :userId with regex group ([^/]+)
        const regexPattern = '^' + routePattern.replace(/:[^\/]+/g, '([^/]+)') + '$';
        const match = reqPath.match(new RegExp(regexPattern));

        if (match) {
            const paramNames = (routePattern.match(/:[^\/]+/g) || []).map(p => p.substring(1));
            const parsedParams: Record<string, string> = {};
            paramNames.forEach((name, i) => {
                parsedParams[name] = match[i + 1];
            });
            return { key, parsedParams };
        }
    }
    return null;
};

/**
 * Centralized validation middleware that uses predefined schemas
 */
export const validationMiddleware = (validationSchemas: Record<string, ZodSchema>) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const method = req.method.toUpperCase();
        const path = req.path;

        const match = findSchemaAndParams(method, path, validationSchemas);
        if (!match) {
            // No schema defined for this endpoint, proceed
            return next();
        }

        const { key: schemaKey, parsedParams } = match;
        const schema = validationSchemas[schemaKey];

        // Flat data object combining all sources
        const data = {
            ...req.query,
            ...parsedParams,
            ...req.body
        };

        const result = await validateData(data, schema);

        if (!result.success) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: result.errors,
            });
            return;
        }

        // Apply validated data back to request depending on where it came from.
        // For simplicity, we can update body for everything not a param or query.
        // But since it's flat, we can just attach it to `req.body` and express will grab what it needs,
        // or better, just merge back.
        if (result.data) {
            // Re-distribute the validated data
            if (req.method.toUpperCase() === 'GET') {
                req.query = result.data;
            } else {
                // keep params separate if they exist
                Object.keys(parsedParams).forEach(k => {
                    if (result.data && result.data[k]) {
                        req.params[k] = result.data[k];
                        delete result.data[k];
                    }
                });
                req.body = result.data;
            }
        }

        next();
    };
};

/**
 * Validate all (body + params) with a combined schema
 */
export const validateAll = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = { body: req.body, params: req.params };
            const result = await validateData(data, schema);

            if (!result.success) {
                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: result.errors,
                });
                return;
            }

            // Update request with validated data
            if (result.data && result.data.body) {
                req.body = result.data.body;
            }
            if (result.data && result.data.params) {
                req.params = result.data.params as any;
            }

            next();
        } catch (err: any) {
            logger.error('Validation middleware error:', err);
            res.status(500).json({
                success: false,
                message: 'Internal validation error',
            });
        }
    };
};
