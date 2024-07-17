import { MakeNullishOptional } from 'sequelize/types/utils';
import { Repository } from './repository';
import { Model, ModelCtor } from 'sequelize-typescript';

export class SequelizeRepository<T extends Model> extends Repository<T> {
  constructor(private model: ModelCtor<T>, ttl: number) {
    super(model.name, ttl);
  }

  override async getById(id: string): Promise<T | null> {
    // Check if the object is in cache
    let item = await super.getById(id);
    if (item) return item;

    // Otherwise retrieve it with Sequelize ORM
    item = await this.model.findByPk(id);
    await super.setCache(item, id);
    return item;
  }

  async getAll(): Promise<T[]> {
    return this.model.findAll();
  }

  async create(item: T): Promise<T> {
    const itemWithId = await this.model.create(item as MakeNullishOptional<T>);
    await super.setCache(itemWithId, itemWithId.id);
    return itemWithId;
  }

  async update(id: string, item: Partial<T>): Promise<void> {
    const existingItem = await this.getById(id);
    if (existingItem)
      await existingItem.update(item as MakeNullishOptional<T>);
  }

  async delete(id: string): Promise<void> {
    const item = await this.getById(id);
    if (item)
      await item.destroy();
  }
}
