import { DocumentData } from 'firebase-admin/firestore';
import { JSONSerializable, IWithUID } from '../db/firestore';

export default class User extends JSONSerializable implements IWithUID {

  constructor(
    public regDateTimestamp: number,
    public deletedCharactersUIDs: string[],
    public nickname: string,
    public email: string,
    public campaignsUIDs: string[],
    public charactersUIDs: string[],
    public uid?: string,
  ) { super(); }

  static fromJSON(json: DocumentData): User {
    return new User(
      json.regDateTimestamp,
      json.deletedCharactersUIDs,
      json.nickname,
      json.email,
      json.campaignsUIDs,
      json.charactersUIDs,
    );
  }
}