import { Request, Response } from 'express';
import { sql } from 'drizzle-orm';
import { asyncHandler } from '@middleware/errorHandler';
import { successResponse } from '@utils/response';
import { getDatabase } from '@config/database';
import { createLogger } from '@utils/logger';

const logger = createLogger('health');


export const healthCheck = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json(
    successResponse(
      {
        status: 'operational',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      },
      req.path,
      'Service is healthy'
    )
  );
});


export const readiness = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Verify database connection
    const db = getDatabase();
    await db.execute(sql`SELECT 1`);

    res.status(200).json(
      successResponse(
        {
          status: 'ready',
          database: 'connected',
          timestamp: new Date().toISOString(),
        },
        req.path,
        'Service is ready'
      )
    );
  } catch (error) {
    logger.error('Readiness check failed', error);
    res.status(503).json({
      status: 'error',
      message: 'Service not ready',
      timestamp: new Date().toISOString(),
      path: req.path,
    });
  }
});
