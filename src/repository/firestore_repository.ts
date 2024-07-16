import { IRepository } from './repository';
import { FirestoreManager, WithUID, JSONSerializable } from '../db/firestore';

export class FirestoreRepository<T extends WithUID & JSONSerializable> implements IRepository<T> {
  private collectionName: string;

  private firestoreManager: FirestoreManager;

  private factory: (json: any) => T;

  constructor(collectionName: string, factory: (json: any) => T) {
    this.collectionName = collectionName;
    this.firestoreManager = FirestoreManager.getInstance();
    this.factory = factory;
  }

  async getById(id: string): Promise<T | null> {
    try {
      return await this.firestoreManager.get<T>(this.collectionName, id, this.factory);
    } catch {
      return null;
    }
  }

  async getAll(): Promise<T[]> {
    return this.firestoreManager.getList<T>(this.collectionName, this.factory);
  }

  async create(item: T): Promise<T> {
    const id = await this.firestoreManager.post(this.collectionName, item.toJSON());
    item.uid = id;
    return item;
  }

  async update(id: string, item: T): Promise<T | null> {
    const existingItem = await this.getById(id);
    if (!existingItem) {
      return null;
    }
    await this.firestoreManager.put(`${this.collectionName}/${id}`, item.toJSON());
    item.uid = id;
    return item;
  }

  async delete(id: string): Promise<void> {
    await this.firestoreManager.deleteCollection(`${this.collectionName}/${id}`);
  }
}
