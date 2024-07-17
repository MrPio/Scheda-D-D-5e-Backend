import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();
export const redis = process.env.USE_REDIS ? new Redis({
  host: process.env.REDIS_HOST ?? 'localhost',
  password: process.env.REDIS_PASSWORD ?? 'toor',
  port: +(process.env.REDIS_PORT ?? 6379),
}) : undefined;

redis?.on('connect', () => console.log('Connected to Redis'));
redis?.on('error', (error) => console.error('Redis connection error:', error));
