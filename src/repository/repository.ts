import { redis } from '../db/redis';

export const useRedis: boolean = false;

export abstract class Repository<T> {
  constructor(private modelName: string, private ttl: number) { }

  protected async setCache(item: T | null, id: string) {
    if (useRedis && item)
      await redis!.set(`${this.modelName}:${id}`, JSON.stringify(item), 'EX', this.ttl);
  }

  async getById(id: string): Promise<T | null> {
    if (!useRedis) return null;
    // Check if the object is in cache
    const item = await redis!.get(`${this.modelName}:${id}`);
    if (item)
      console.log(`Object ${id} of class ${this.modelName} was found in Redis cache`);
    return item ? JSON.parse(item) : null;
  }
  abstract getAll(): Promise<T[]>;
  abstract create(item: T): Promise<T>;
  abstract update(id: string, item: Partial<T>): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
