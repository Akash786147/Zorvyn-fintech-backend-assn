import express, { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import config from './config/environment';
import { swaggerSpec } from './config/swagger';
import { configureMiddleware } from './config/middleware';
import { initializeDatabase, closeDatabase } from './config/database';
import { initializeRedis, closeRedis } from './utils/redis';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestIdMiddleware } from './middleware/requestId';
import healthRoutes from './routes/health';
import router from './routes/index';

import { createLogger } from './utils/logger';

const logger = createLogger('app');

const createApp = (): Express => {
  const app = express();

  configureMiddleware(app);

  app.use(requestIdMiddleware);

  // Health check routes
  app.use('/', healthRoutes);

  // Swagger/OpenAPI documentation
  app.use('/api/docs', swaggerUi.serve);
  app.get('/api/docs', swaggerUi.setup(swaggerSpec, { swaggerOptions: { url: '/api/docs.json' } }));
  app.get('/api/docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // API routes
  app.use('/api/v1',router);

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
