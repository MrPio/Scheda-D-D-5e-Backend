import FirestoreManager from '../src/repository/firestore_manager';
import { WithUID, JSONSerializable } from '../src/repository/firestore_manager';

// Sample model that implements WithUID and JSONSerializable
class SampleModel implements WithUID, JSONSerializable {
  uid?: string;
  regDateTimestamp: number;
  deletedCharactersUIDs: string[];
  nickname: string;
  email: string;
  campaignsUIDs: string[];
  charactersUIDs: string[];

  constructor(
    regDateTimestamp: number,
    deletedCharactersUIDs: string[],
    nickname: string,
    email: string,
    campaignsUIDs: string[],
    charactersUIDs: string[]
  ) {
    this.regDateTimestamp = regDateTimestamp;
    this.deletedCharactersUIDs = deletedCharactersUIDs;
    this.nickname = nickname;
    this.email = email;
    this.campaignsUIDs = campaignsUIDs;
    this.charactersUIDs = charactersUIDs;
  }

  toJSON(): object {
    return {
      regDateTimestamp: this.regDateTimestamp,
      deletedCharactersUIDs: this.deletedCharactersUIDs,
      nickname: this.nickname,
      email: this.email,
      campaignsUIDs: this.campaignsUIDs,
      charactersUIDs: this.charactersUIDs
    };
  }

  static fromJSON(json: any): SampleModel {
    // Log to see what is being passed
    return new SampleModel(
      json.regDateTimestamp,
      json.deletedCharactersUIDs,
      json.nickname,
      json.email,
      json.campaignsUIDs,
      json.charactersUIDs
    );
  }
}

// Make sure that SampleModel has fromJSON as part of its instance
interface SampleModel extends JSONSerializable {
  fromJSON: (json: object) => SampleModel;
}

const testFirestoreManager = async () => {
  const firestoreManager = FirestoreManager.getInstance();
  
  const sampleUID = 'k9vc0kojNcO9JB9qVdf33F6h3eD2';
  const sampleCollection = 'users';

  try {
    const document = await firestoreManager.get<SampleModel>(sampleCollection, sampleUID, SampleModel.fromJSON);
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