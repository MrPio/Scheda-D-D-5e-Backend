import { DocumentData, Firestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as admin from 'firebase-admin';

const serviceAccount = JSON.parse(fs.readFileSync('src/firebase_configs/service_account_key.json', 'utf8'));

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
export const db = admin.firestore();

// Interface representing an object with a unique identifier
export interface WithUID {
  uid?: string;
}

export abstract class JSONSerializable {
  static fromJSON(json: DocumentData):JSONSerializable {
    throw new Error('Abstract method not implemented');
  }
  
  abstract toJSON(): object;
}

// Singleton class for managing Firestore interactions
export class FirestoreManager {
  private static instance: FirestoreManager;

  private _database: Firestore;

  private paginateKeys: Map<string, string | null> = new Map();

  // Private constructor to prevent direct instantiation
  private constructor() {
    this._database = db;
  }

  // Get the single instance of FirestoreManager
  public static getInstance(): FirestoreManager {
    if (!FirestoreManager.instance) {
      FirestoreManager.instance = new FirestoreManager();
    }
    return FirestoreManager.instance;
  }

  // Get a document from a collection by its UID
  async get<T extends WithUID & JSONSerializable>(collectionName: string, uid: string, factory: (json: DocumentData) => T): Promise<T> {
    const docRef = this._database.collection(collectionName).doc(uid);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      throw new Error('Document not found');
    }
    const data = docSnap.data()!;
    const model = factory(data);
    model.uid = uid;
    return model;
  }

  // Get a paginated list of documents from a collection
  async getList<T extends JSONSerializable>(collectionName: string, factory: (json: object) => T, pageSize: number = 30): Promise<T[]> {
    const lastKey = this.paginateKeys.get(collectionName);
    let query = this._database.collection(collectionName).orderBy('id').limit(pageSize);
    if (lastKey) {
      query = query.startAfter(lastKey);
    }
    const querySnapshot = await query.get();
    const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    this.paginateKeys.set(collectionName, lastDoc ? lastDoc.id : null);

    return querySnapshot.docs.map(docSnap => factory(docSnap.data()!));
  }

  // Get a list of documents by their UIDs from a collection
  async getListFromUIDs<T extends WithUID & JSONSerializable>(collectionName: string, uids: string[], factory: (json: any) => T): Promise<T[]> {
    const querySnapshot = await this._database.collection(collectionName).where('id', 'in', uids).get();
    return querySnapshot.docs.map(docSnap => {
      const data = docSnap.data()!;
      const model = factory(data);
      model.uid = docSnap.id;
      return model;
    });
  }

  // Update or create a document at a specific path
  async put(path: string, object: object): Promise<void> {
    const docRef = this._database.doc(path);
    await docRef.set(object);
  }

  // Create a new document in a collection and return its ID
  async post(collectionName: string, object: object): Promise<string> {
    const collectionRef = this._database.collection(collectionName);
    const docRef = collectionRef.doc();
    await docRef.set(object);
    return docRef.id;
  }

  // Delete all documents in a collection
  async deleteCollection(collectionName: string): Promise<void> {
    const collectionRef = this._database.collection(collectionName);
    const querySnapshot = await collectionRef.get();
    const batch = this._database.batch();
    querySnapshot.docs.forEach(docSnap => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
  }
}

export default FirestoreManager;