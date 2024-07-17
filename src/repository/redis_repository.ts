import { Repository } from './repository';
import { WithUID } from '../db/firestore';

export class RedisRepository<T extends WithUID> extends Repository<T> {

  override async getById(id: string): Promise<T | null> {
    return super.getById(id, false);
  }

  async getAll(): Promise<T[]> {
    throw new Error('Method not allowed when using RedisRepository');
  }

  async create(item: T): Promise<T> {
    await super.setCache(item.uid!, item);
    return item;
  }

  async update(id: string, item: Partial<T>): Promise<void> {
    await super.setCache(id!, item as T);
  }

  async delete(id: string): Promise<void> {
    return super.invalidateCache(id);
  }
}
