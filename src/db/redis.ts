import { Redis } from 'ioredis';
import { useRedis } from '../repository/repository';
import dotenv from 'dotenv';

dotenv.config();
export const redis = useRedis ? new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: +(process.env.REDIS_PORT ?? 6379),
}) : undefined;

redis?.on('connect', () => console.log('Connected to Redis'));
redis?.on('error', (error) => console.error('Redis connection error:', error));
