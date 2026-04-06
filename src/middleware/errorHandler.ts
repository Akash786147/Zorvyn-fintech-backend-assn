import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { errorResponse } from '../utils/response';
import { createLogger } from '../utils/logger';

const logger = createLogger('error-handler');

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    if (err instanceof AppError) {
        logger.warn('API Error', err);

        res.status(err.statusCode).json(errorResponse(err.message, req.path));
    } else {
        logger.error('Unhandled error', err);

        res.status(500).json(
            errorResponse('Internal Server Error', req.path)
        );
    }
};

export const notFoundHandler = (
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    logger.debug('Route not found', {
        method: req.method,
        path: req.path,
    });

    res.status(404).json(
        errorResponse(`Route not found: ${req.method} ${req.path}`, req.path)
    );
};

export const asyncHandler = (
    fn: (req: any, res: any, next: NextFunction) => Promise<any>
) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
