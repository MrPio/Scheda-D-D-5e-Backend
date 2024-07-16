import { IRepository } from './repository';
import { FirestoreManager, JSONSerializable } from '../db/firestore';
import { DocumentData } from 'firebase-admin/firestore';

export class FirestoreRepository<T extends JSONSerializable> implements IRepository<T> {
  private collectionName: string;

  private firestoreManager: FirestoreManager;

  private factory: (json: DocumentData) => T;

  constructor(collectionName: string, factory: (json: DocumentData) => T) {
    this.collectionName = collectionName;
    this.firestoreManager = FirestoreManager.getInstance();
    this.factory = factory;
  }

  async getById(id: string): Promise<T> {
    const obj = await this.firestoreManager.get<T>(this.collectionName, id, this.factory);
    return obj;
  }

  async getAll(): Promise<T[]> {
    return this.firestoreManager.getList<T>(this.collectionName, this.factory);
  }

  async create(item: T): Promise<T> {
    const id = await this.firestoreManager.post(this.collectionName, item.toJSON());
    if ('uid' in item)
      item.uid = id;
    return item;
  }

  async update(id: string, item: T): Promise<T | null> {
    // const existingItem = await this.getById(id);
    // if (!existingItem) {
    //   return null;
    // }
    await this.firestoreManager.patch(`${this.collectionName}/${id}`, item.toJSON());
    return item;
  }

  async delete(id: string): Promise<void> {
    await this.firestoreManager.delete(`${this.collectionName}/${id}`);
  }
}
