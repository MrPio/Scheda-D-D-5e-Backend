import { IRepository } from './repository';
import { SequelizeRepository } from './sequelize_repository';
import { FirestoreRepository } from './firestore_repository';
import { ModelCtor, Model } from 'sequelize-typescript';
import { WithUID, JSONSerializable } from '../db/firestore';
import { DocumentData } from 'firebase-admin/firestore';

export class RepositoryFactory {
  static getSequelizeRepository<T extends Model>(model: ModelCtor<T>): IRepository<T> {
    return new SequelizeRepository<T>(model);
  }

  static getFirestoreRepository<T extends WithUID & JSONSerializable>(collectionName: string, factory: (json: DocumentData) => T): IRepository<T> {
    return new FirestoreRepository<T>(collectionName, factory);
  }
}
