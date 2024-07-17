import { MakeNullishOptional } from 'sequelize/types/utils';
import { Repository } from './repository';
import { Model, ModelCtor } from 'sequelize-typescript';

export class SequelizeRepository<T extends Model> extends Repository<T> {
  constructor(private model: ModelCtor<T>, ttl: number) {
    super(model.name, ttl);
  }

  override async getById(id: string, noCache: boolean = false): Promise<T | null> {
    // Check if the object is in cache
    let item = await super.getById(id, noCache);
    if (item) return item;

    // Otherwise retrieve it with Sequelize ORM
    item = await this.model.findByPk(id);
    await super.setCache(id, item);
    return item;
  }

  async getAll(): Promise<T[]> {
    return this.model.findAll();
  }

  async create(item: T): Promise<T> {
    const itemWithId = await this.model.create(item as MakeNullishOptional<T>);
    await super.setCache(itemWithId.id, itemWithId);
    return itemWithId;
  }

  async update(id: string, item: Partial<T>): Promise<void> {
    const existingItem = await this.getById(id, true);
    super.invalidateCache(id);
    if (existingItem)
      await existingItem.update(item as MakeNullishOptional<T>);
  }

  async delete(id: string): Promise<void> {
    const item = await this.getById(id);
    super.invalidateCache(id);
    if (item)
      await item.destroy();
  }
}
