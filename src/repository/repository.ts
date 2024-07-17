import { redis } from '../db/redis';

export abstract class Repository<T> {
  constructor(private modelName: string, private ttl: number) { console.log(redis); }

  protected async setCache(id: string, item: T | null) {
    if (process.env.USE_REDIS && item)
      await redis!.set(`${this.modelName}:${id}`, JSON.stringify(item), 'EX', this.ttl);
  }

  protected async invalidateCache(id: string) {
    if (process.env.USE_REDIS)
      await redis!.del(`${this.modelName}:${id}`);
  }

  async getById(id: string, noCache: boolean = false): Promise<T | null> {
    if (!process.env.USE_REDIS || noCache) return null;
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
