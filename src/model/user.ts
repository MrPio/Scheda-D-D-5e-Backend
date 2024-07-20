import { DocumentData } from 'firebase-admin/firestore';
import { JSONSerializable, IWithUID } from '../db/firestore';

/**
 * Represents a user in the system.
 * A `User` contains information about their registration, associated characters, 
 * campaigns, and other relevant details.
 */
export default class User extends JSONSerializable implements IWithUID {

  /**
   * Constructs a `User` instance.
   * @param regDateTimestamp - Timestamp of the user's registration.
   * @param deletedCharactersUIDs - List of unique identifiers for characters that have been deleted by the user.
   * @param nickname - The nickname chosen by the user.
   * @param email - The email address of the user.
   * @param campaignsUIDs - List of unique identifiers for campaigns associated with the user.
   * @param charactersUIDs - List of unique identifiers for characters owned by the user.
   * @param uid - Optional unique identifier for the user.
   */
  constructor(
    public regDateTimestamp: number,
    public deletedCharactersUIDs: string[],
    public nickname: string,
    public email: string,
    public campaignsUIDs: string[],
    public charactersUIDs: string[],
    public uid?: string,
  ) { super(); }

  /**
   * Creates a `User` instance from a JSON object.
   * @param json - The JSON object containing user data.
   * @returns A `User` instance.
   */
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