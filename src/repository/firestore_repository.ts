import { Repository } from './repository';
import { FirestoreManager, JSONSerializable } from '../db/firestore';
import { DocumentData } from 'firebase-admin/firestore';

/**
 * A repository for managing Firestore entities.
 * Extends `Repository` to interact with Firestore with caching capabilities.
 * 
 * @template T - Type of the entity, extending `JSONSerializable`.
 */
export class FirestoreRepository<T extends JSONSerializable> extends Repository<T> {
  private firestoreManager = FirestoreManager.getInstance();

  /**
   * Creates an instance of `FirestoreRepository`.
   * @param collectionName - Name of the Firestore collection.
   * @param factory - Function to create an instance of `T` from JSON data.
   * @param ttl - Time to live for cache entries.
   */
  constructor(private collectionName: string, private factory: (json: DocumentData) => T, ttl: number) {
    super(collectionName, ttl);
  }

  /**
   * Retrieves an entity by its unique identifier.
   * First checks the cache, then retrieves from Firestore if not cached.
   * @param id - Unique identifier of the entity.
   * @returns The entity instance.
   */
  override async getById(id: string): Promise<T> {
    // Check if the object is in cache
    let item = await super.getById(id);
    if (item) return item;

    // Otherwise retrieve it with Sequelize ORM
    item = await this.firestoreManager.get<T>(this.collectionName, id, this.factory);
    await super.setCache(id, item);
    return item;
  }

  /**
   * Retrieves all entities from the collection.
   * @returns A list of all entities.
   */
  async getAll(): Promise<T[]> {
    return this.firestoreManager.getList<T>(this.collectionName, this.factory);
  }

  /**
   * Creates a new entity in the Firestore collection.
   * @param item - The entity instance to create.
   * @returns The created entity, with its `uid` set if applicable.
   */
  async create(item: T): Promise<T> {
    const uid = await this.firestoreManager.post(this.collectionName, item.toJSON());
    if ('uid' in item)
      item.uid = uid;
    await super.setCache(uid, item);
    return item;
  }

  /**
   * Updates an existing entity in the Firestore collection.
   * Invalidates the cache for the entity after updating.
   * @param id - Unique identifier of the entity.
   * @param item - Partial entity data to update.
   */
  async update(id: string, item: Partial<T>): Promise<void> {
    super.invalidateCache(id);
    await this.firestoreManager.patch(`${this.collectionName}/${id}`, item);
  }

  /**
   * Deletes an entity from the Firestore collection.
   * Invalidates the cache for the entity after deletion.
   * @param id - Unique identifier of the entity.
   */
  async delete(id: string): Promise<void> {
    super.invalidateCache(id);
    await this.firestoreManager.delete(`${this.collectionName}/${id}`);
  }
}
