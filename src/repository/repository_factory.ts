import { IRepository } from './repository';
import { SequelizeRepository } from './sequelize_repository';
import { FirestoreRepository } from './firestore_repository';
import { ModelCtor, Model } from 'sequelize-typescript';
import { WithUID, JSONSerializable } from '../db/firestore_manager';

export class RepositoryFactory {
  static getSequelizeRepository<T extends Model>(model: ModelCtor<T>): IRepository<T> {
    return new SequelizeRepository<T>(model);
  }

  static getFirestoreRepository<T extends WithUID & JSONSerializable>(collectionName: string, factory: (json: any) => T): IRepository<T> {
    return new FirestoreRepository<T>(collectionName, factory);
  }
}
