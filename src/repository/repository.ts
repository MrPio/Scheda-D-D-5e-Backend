import { redis } from '../db/redis';

/**
 * Base class for repositories managing entities in various data stores.
 * Provides caching functionality using Redis.
 * @typeparam T - The type of the entity managed by the repository.
 */
export abstract class Repository<T> {
  /**
   * Constructs a `Repository` instance.
   * @param modelName - The name of the model/entity this repository manages.
   * @param ttl - The time-to-live (TTL) for cached items, in seconds.
   */
  constructor(private modelName: string, private ttl: number) { }

  /**
   * Sets an item in the cache with a specified TTL.
   * @param id - The unique identifier of the item.
   * @param item - The item to cache. If null, no cache operation is performed.
   */
  protected async setCache(id: string, item: T | null) {
    if ((process.env.USE_REDIS ?? 'true') == 'true' && item) {
      await redis!.set(`${this.modelName}:${id}`, JSON.stringify(item), 'EX', this.ttl);
    }
  }

  /**
   * Invalidates the cache for a specific item.
   * @param id - The unique identifier of the item to invalidate in the cache.
   */
  protected async invalidateCache(id: string) {
    if ((process.env.USE_REDIS ?? 'true') == 'true')
      await redis!.del(`${this.modelName}:${id}`);
  }

  /**
   * Retrieves an item by its ID from the cache.
   * @param id - The unique identifier of the item.
   * @param noCache - If true, bypasses the cache and does not perform a cache lookup.
   * @returns The item if found in the cache; otherwise, null.
   */
  async getById(id: string, noCache: boolean = false): Promise<T | null> {
    if ((process.env.USE_REDIS ?? 'true') != 'true' || noCache)
      return null;

    // Check if the object is in cache
    const item = await redis!.get(`${this.modelName}:${id}`);
    if (item) {
      console.log(`Object ${id.length > 50 ? id.substring(0, 50) + '...' : id} of class ${this.modelName} was found in Redis cache`);
    }
    return item ? JSON.parse(item) : null;
  }

  /**
   * Retrieves all items from the repository.
   * @returns A promise that resolves to an array of items.
   */
  abstract getAll(): Promise<T[]>;

  /**
   * Creates a new item in the repository.
   * @param item - The item to create.
   * @returns A promise that resolves to the created item.
   */
  abstract create(item: T): Promise<T>;

  /**
   * Updates an existing item in the repository.
   * @param id - The unique identifier of the item to update.
   * @param item - The partial item data to update.
   * @returns A promise that resolves when the update is complete.
   */
  abstract update(id: string, item: Partial<T>): Promise<void>;

  /**
   * Deletes an item from the repository.
   * @param id - The unique identifier of the item to delete.
   * @returns A promise that resolves when the deletion is complete.
   */
  abstract delete(id: string): Promise<void>;
}
