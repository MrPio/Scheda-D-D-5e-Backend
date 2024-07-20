import { Repository } from './repository';
import { IWithUID } from '../db/firestore';

/**
 * A repository for managing entities with Redis cache.
 * Extends `Repository` to provide cache-based storage for entities.
 * 
 * @template T - Type of the entity, extending `IWithUID`.
 */
export class RedisRepository<T extends IWithUID> extends Repository<T> {

  /**
   * Retrieves an entity by its unique identifier from the cache.
   * @param id - Unique identifier of the entity.
   * @returns The entity instance or `null` if not found.
   */
  override async getById(id: string): Promise<T | null> {
    return super.getById(id, false);
  }

  /**
   * Throws an error as this method is not supported in Redis-based repositories.
   * @throws Error - Method not allowed when using RedisRepository.
   */
  async getAll(): Promise<T[]> {
    throw new Error('Method not allowed when using RedisRepository');
  }

  /**
   * Creates a new entity and stores it in the cache.
   * @param item - The entity instance to create.
   * @returns The created entity.
   */
  async create(item: T): Promise<T> {
    await super.setCache(item.uid!, item);
    return item;
  }

  /**
   * Updates an existing entity in the cache.
   * @param id - Unique identifier of the entity.
   * @param item - Partial entity data to update.
   */
  async update(id: string, item: Partial<T>): Promise<void> {
    await super.setCache(id!, item as T);
  }

  /**
   * Deletes an entity from the cache.
   * @param id - Unique identifier of the entity.
   */
  async delete(id: string): Promise<void> {
    return super.invalidateCache(id);
  }
}
