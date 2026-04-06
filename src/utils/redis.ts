import { createClient, RedisClientType } from 'redis';
import config from '../config/environment';
import { createLogger } from './logger';

const logger = createLogger('redis');

let redisClient: RedisClientType | null = null;
let isConnected = false;

/**
 * Initialize Redis client
 */
export const initializeRedis = async (): Promise<void> => {
    if (!config.redis.enabled) {
        logger.info('Redis caching disabled');
        return;
    }

    try {
        redisClient = createClient({
            username: config.redis.username,
            password: config.redis.password,
            socket: {
                host: config.redis.host,
                port: config.redis.port,
            },
        });

        redisClient.on('error', (err: Error) => {
            logger.error('Redis client error', { error: err.message });
            isConnected = false;
        });

        redisClient.on('connect', () => {
            logger.info('Redis client connected');
            isConnected = true;
        });

        await redisClient.connect();
        logger.info('Redis successfully initialized', {
            host: config.redis.host,
            port: config.redis.port,
        });
    } catch (error) {
        logger.error('Failed to initialize Redis', error);
        isConnected = false;
        // Don't throw - allow app to run without Redis
    }
};

/**
 * Close Redis connection
 */
export const closeRedis = async (): Promise<void> => {
    if (redisClient && isConnected) {
        try {
            await redisClient.quit();
            logger.info('Redis connection closed');
            isConnected = false;
        } catch (error) {
            logger.error('Error closing Redis connection', error);
        }
    }
};

/**
 * Get value from Redis cache
 */
export const getCached = async <T = any>(key: string): Promise<T | null> => {
    if (!redisClient || !isConnected) {
        return null;
    }

    try {
        const value = await redisClient.get(key);
        if (value) {
            logger.debug('Cache hit', { key });
            return JSON.parse(value) as T;
        }
        logger.debug('Cache miss', { key });
        return null;
    } catch (error) {
        logger.warn('Error retrieving from cache', { key, error });
        return null;
    }
};

/**
 * Set value in Redis cache with TTL
 */
export const setCached = async <T = any>(
    key: string,
    value: T,
    ttlSeconds: number = 3600 // Default 1 hour
): Promise<boolean> => {
    if (!redisClient || !isConnected) {
        return false;
    }

    try {
        await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
        logger.debug('Cache set', { key, ttl: ttlSeconds });
        return true;
    } catch (error) {
        logger.warn('Error setting cache', { key, error });
        return false;
    }
};

/**
 * Delete value from Redis cache
 */
export const deleteCached = async (key: string): Promise<boolean> => {
    if (!redisClient || !isConnected) {
        return false;
    }

    try {
        await redisClient.del(key);
        logger.debug('Cache deleted', { key });
        return true;
    } catch (error) {
        logger.warn('Error deleting from cache', { key, error });
        return false;
    }
};

/**
 * Clear all cache keys matching a pattern
 */
export const clearCachePattern = async (pattern: string): Promise<number> => {
    if (!redisClient || !isConnected) {
        return 0;
    }

    try {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(keys);
            logger.debug('Cache pattern cleared', { pattern, count: keys.length });
        }
        return keys.length;
    } catch (error) {
        logger.warn('Error clearing cache pattern', { pattern, error });
        return 0;
    }
};

/**
 * Check if Redis is connected
 */
export const isRedisConnected = (): boolean => {
    return isConnected;
};

/**
 * Get Redis client instance (for advanced operations)
 */
export const getRedisClient = (): RedisClientType | null => {
    return redisClient;
};
