import { Repository } from './repository';
import { FirestoreManager, JSONSerializable } from '../db/firestore';
import { DocumentData } from 'firebase-admin/firestore';

export class FirestoreRepository<T extends JSONSerializable> extends Repository<T> {
  private firestoreManager = FirestoreManager.getInstance();

  constructor(private collectionName: string, private factory: (json: DocumentData) => T, ttl: number) {
    super(collectionName, ttl);
  }

  async getById(id: string): Promise<T> {
    // Check if the object is in cache
    let item = await super.getById(id);
    if (item) return item;

    // Otherwise retrieve it with Sequelize ORM
    item = await this.firestoreManager.get<T>(this.collectionName, id, this.factory);
    await super.setCache(item, id);
    return item;
  }

  async getAll(): Promise<T[]> {
    return this.firestoreManager.getList<T>(this.collectionName, this.factory);
  }

  async create(item: T): Promise<T> {
    const uid = await this.firestoreManager.post(this.collectionName, item.toJSON());
    if ('uid' in item)
      item.uid = uid;
    await super.setCache(item, uid);
    return item;
  }

  async update(id: string, item: Partial<T>): Promise<void> {
    await this.firestoreManager.patch(`${this.collectionName}/${id}`, item);
  }

  async delete(id: string): Promise<void> {
    await this.firestoreManager.delete(`${this.collectionName}/${id}`);
  }
}
