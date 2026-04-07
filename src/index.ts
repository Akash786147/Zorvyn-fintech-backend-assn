import express, { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import config from './config/environment';
import { swaggerSpec } from './config/swagger';
import { configureMiddleware } from './config/middleware';
import { initializeDatabase, closeDatabase } from './config/database';
import { initializeRedis, closeRedis } from './utils/redis';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestIdMiddleware } from './middleware/requestId';
import healthRoutes from './routes/health.router';
import router from './routes/index';

import { createLogger } from './utils/logger';

const logger = createLogger('app');

const createApp = (): Express => {
  const app = express();

  configureMiddleware(app);

  app.use(requestIdMiddleware);

  // Health check routes
  app.use('/', healthRoutes);

  // Root route 404 HTML
  app.get('/', (_req, res) => {
    res.status(404).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>404 - Not Found</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f8f9fa; color: #333; }
          .container { text-align: center; max-width: 600px; padding: 40px; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          h1 { font-size: 80px; margin: 0; color: #e74c3c; }
          h2 { font-size: 24px; margin-top: 0; }
          p { margin-bottom: 30px; color: #6c757d; }
          a { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; transition: background-color 0.2s; }
          a:hover { background-color: #0056b3; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>404</h1>
          <h2>Page Not Found</h2>
          <p>The page you are looking for does not exist or has been moved.</p>
          <a href="/api/docs">Go to API Documentation</a>
        </div>
      </body>
      </html>
    `);
  });

  // Swagger/OpenAPI documentation
  const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customCss: '.swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }', customCssUrl: CSS_URL }));
  app.get('/api/docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // API routes
  app.use('/api/v1', router);

  app.use(notFoundHandler);

  app.use(errorHandler);

  return app;
};


const startServer = async (): Promise<void> => {
  try {
    await initializeDatabase();
    await initializeRedis();

    const app = createApp();

    const server = app.listen(config.port, config.host, () => {
      logger.info('Server started', {
        port: config.port,
        url: `http://${config.host}:${config.port}`,
      });
    });

    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.info(`Received ${signal} signal, shutting down gracefully...`);

      server.close(async () => {
        await closeRedis();
        await closeDatabase();
        logger.info('Server shutdown complete');
        process.exit(0);
      });

      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught exception', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason: any) => {
      logger.error('Unhandled rejection', reason);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
