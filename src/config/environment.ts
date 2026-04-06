import dotenv from 'dotenv';

dotenv.config();

interface Config {
    nodeEnv: string;
    port: number;
    host: string;
    databaseUrl: string;
    apiPrefix: string;
    logLevel: string;
    allowedOrigins: string[];
    jwtSecret: string;
    jwtExpiry: string;
    rateLimitWindowMs: number;
    rateLimitMaxRequests: number;
    redis: {
        host: string;
        port: number;
        username: string;
        password: string;
        enabled: boolean;
    };
}

const config: Config = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || 'localhost',
    databaseUrl: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/zorvyn_fintech',
    apiPrefix: process.env.API_PREFIX || '/api/v1',
    logLevel: process.env.LOG_LEVEL || 'info',
    allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key_change_this',
    jwtExpiry: process.env.JWT_EXPIRY || '7d',
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        username: process.env.REDIS_USERNAME || 'default',
        password: process.env.REDIS_PASSWORD || '',
        enabled: process.env.REDIS_ENABLED === 'true',
    },
};

export default config;
