import { Redis } from 'ioredis';

// Initialize Redis connection if environment variable USE_REDIS is set to 'true'
export const redis = ((process.env.USE_REDIS ?? 'true') == 'true') ? new Redis({
  host: process.env.REDIS_HOST ?? 'localhost',
  password: process.env.REDIS_PASSWORD ?? 'toor',
  port: +(process.env.REDIS_PORT ?? 6379),
}) : undefined;

// Event listeners for Redis connection
redis?.on('connect', () => { console.log('Connected to Redis'); redis.flushall(); }); // Clear all data in the Redis database upon connection
redis?.on('error', (error) => console.error('Redis connection error:', error));
