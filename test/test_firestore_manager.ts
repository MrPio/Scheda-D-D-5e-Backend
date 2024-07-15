import { DocumentData } from 'firebase-admin/firestore';
import { WithUID, JSONSerializable, FirestoreManager } from '../src/repository/firestore_manager';

// Sample model that implements JSONSerializable
export class SampleModel extends JSONSerializable implements WithUID {

  constructor(
    public regDateTimestamp: number,
    public deletedCharactersUIDs: string[],
    public nickname: string,
    public email: string,
    public campaignsUIDs: string[],
    public charactersUIDs: string[],
    public uid?: string,
  ) {
    super();
  }

  toJSON(): object {
    return {
      regDateTimestamp: this.regDateTimestamp,
      deletedCharactersUIDs: this.deletedCharactersUIDs,
      nickname: this.nickname,
      email: this.email,
      campaignsUIDs: this.campaignsUIDs,
      charactersUIDs: this.charactersUIDs,
    };
  }


  static fromJSON(json: DocumentData): SampleModel {
    return new SampleModel(
      json.regDateTimestamp,
      json.deletedCharactersUIDs,
      json.nickname,
      json.email,
      json.campaignsUIDs,
      json.charactersUIDs,
    );
  }
}


const testFirestoreManager = async () => {
  const firestoreManager = FirestoreManager.getInstance();

  const sampleUID = 'k9vc0kojNcO9JB9qVdf33F6h3eD2';
  const sampleCollection = 'users';

  try {
    const document = await firestoreManager.get(sampleCollection, sampleUID, SampleModel.fromJSON);
    console.log('Retrieved document:', document);
  } catch (error) {
    console.error('Error retrieving document:', error);
  }
};

testFirestoreManager();





/*
export class Person {
  id: string;
  name: string;
  age: number;
  // ... other properties

  constructor(data: DocumentData) {
    this.id = data.id;
    this.name = data.name;
    this.age = data.age;
    // ... assign other properties
  }
}

export async function loadPerson(personId: string): Promise<Person | null> {
  const docRef = doc(firestore, 'persons', personId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data() as DocumentData;
    return new Person(data);
  } else {
    return null;
  }
}
*/