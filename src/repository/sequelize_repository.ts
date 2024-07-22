import { MakeNullishOptional } from 'sequelize/types/utils';
import { Repository } from './repository';
import { Model, ModelCtor } from 'sequelize-typescript';

/**
 * A repository implementation for managing Sequelize models with Redis caching.
 * @typeparam T - The type of the Sequelize model managed by this repository.
 */
export class SequelizeRepository<T extends Model> extends Repository<T> {
  /**
   * Constructs a `SequelizeRepository` instance.
   * @param model - The Sequelize model constructor for the entity this repository manages.
   * @param relatedModel - Array of related models to include in queries.
   * @param ttl - Time-to-live (TTL) for cached items, in seconds.
   */
  constructor(private model: ModelCtor<T>, private relatedModel: ModelCtor<Model>[], ttl: number) {
    super(model.name, ttl);
  }

  /**
   * Retrieves an item by its ID from the cache or database.
   * @param id - The unique identifier of the item.
   * @param noCache - If true, bypasses the cache and directly queries the database.
   * @returns The item if found in cache or database; otherwise, null.
   */
  override async getById(id: string, noCache: boolean = false): Promise<T | null> {
    // Check if the object is in cache
    let item = await super.getById(id, noCache);
    if (item) return item;

    // Otherwise retrieve it with Sequelize ORM
    item = await this.model.findByPk(id, { include: this.relatedModel });
    await super.setCache(id, item);
    return item;
  }

  /**
   * Retrieves all items from the repository, including related models.
   * @returns An array of all items.
   */
  async getAll(): Promise<T[]> {
    return this.model.findAll({ include: this.relatedModel });
  }

  /**
   * Creates a new item in the repository.
   * @param item - The item to create.
   * @returns The created item.
   */
  async create(item: T): Promise<T> {
    const itemWithId = await this.model.create(item as MakeNullishOptional<T>);
    // await super.setCache(itemWithId.id, itemWithId);

    return itemWithId;
  }

  /**
   * Updates an existing item in the repository.
   * @param id - The unique identifier of the item to update.
   * @param item - The partial item data to update.
   */
  async update(id: string, item: Partial<T>): Promise<void> {
    const existingItem = await this.getById(id, true);
    super.invalidateCache(id);
    if (existingItem) {
      await existingItem.update(item as MakeNullishOptional<T>);
    }
  }

  /**
   * Deletes an item from the repository.
   * @param id - The unique identifier of the item to delete.
   */
  async delete(id: string): Promise<void> {
    const item = await this.getById(id);
    super.invalidateCache(id);
    if (item) {
      await item.destroy();
    }
  }
}
