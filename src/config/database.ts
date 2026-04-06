import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool, PoolClient } from 'pg';
import config from './environment';
import { createLogger } from '@utils/logger';

const logger = createLogger('database');

let db: ReturnType<typeof drizzle> | null = null;
let pool: Pool | null = null;

/**
 * Initialize database connection
 */
export const initializeDatabase = async (): Promise<void> => {
    try {
        logger.info('Initializing database connection', {
            host: config.databaseUrl?.split('@')[1]?.split(':')[0] || 'unknown',
        });

        pool = new Pool({
            connectionString: config.databaseUrl,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        pool.on('error', (err: Error) => {
            logger.error('Unexpected error on idle client', err);
        });

        // Test connection
        const client: PoolClient = await pool.connect();
        await client.query('SELECT NOW()');
        client.release();

        db = drizzle(pool);

        logger.info('Database connection established successfully');
    } catch (error) {
        logger.error('Failed to connect to database', error, {
            databaseUrl: config.databaseUrl?.split('@')[1] || 'unknown',
        });
        throw error;
    }
};

/**
 * Get database instance
 */
export const getDatabase = (): ReturnType<typeof drizzle> => {
    if (!db) {
        throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return db;
};

/**
 * Close database connection
 */
export const closeDatabase = async (): Promise<void> => {
    if (pool) {
        await pool.end();
        logger.info('Database connection closed');
    }
};
