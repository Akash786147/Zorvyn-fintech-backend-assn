import { Request, Response, NextFunction, Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import express from 'express';
import config from './environment';
import { createLogger } from '../utils/logger';

const logger = createLogger('middleware');

export const configureMiddleware = (app: Express): void => {

    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
                imgSrc: ["'self'", "data:", "validator.swagger.io"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
            },
        },
    }));

    app.use(
        cors({
            origin: "*",
            credentials: true,
            optionsSuccessStatus: 200,
        })
    );

    app.use(compression());
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging middleware
    app.use((req: Request, res: Response, next: NextFunction): void => {
        const startTime = Date.now();

        res.on('finish', () => {
            const duration = Date.now() - startTime;
            const statusCode = res.statusCode;

            const logContext = {
                requestId: req.id,
                method: req.method,
                path: req.path,
                statusCode,
                duration: `${duration}ms`,
            };

            if (statusCode >= 400) {
                logger.warn('HTTP request', logContext);
            } else {
                logger.debug('HTTP request', logContext);
            }
        });
        next();
    });
};
