import { MakeNullishOptional } from 'sequelize/types/utils';
import { IRepository } from './repository';
import { Model, ModelCtor } from 'sequelize-typescript';

export class SequelizeRepository<T extends Model> implements IRepository<T> {
  private model: ModelCtor<T>;

  constructor(model: ModelCtor<T>) {
    this.model = model;
  }

  async getById(id: string): Promise<T | null> {
    return this.model.findByPk(id);
  }

  async getAll(): Promise<T[]> {
    return this.model.findAll();
  }

  async create(item: T): Promise<T> {
    return this.model.create(item as MakeNullishOptional<T>);
  }

  async update(id: string, item: T): Promise<T | null> {
    const existingItem = await this.getById(id);
    if (!existingItem) {
      return null;
    }
    return existingItem.update(item as MakeNullishOptional<T>);
  }

  async delete(id: string): Promise<void> {
    const item = await this.getById(id);
    if (item) {
      await item.destroy();
    }
  }
}
