import { IWithUID } from '../db/firestore';

/**
 * Represents a token cached for authentication or session management.
 * Implements the `IWithUID` interface to include a unique identifier.
 */
export class CachedToken implements IWithUID {
  public uid?: string;

  /**
   * Constructs a new instance of CachedToken.
   * @param userUID - Unique identifier for the user associated with the token.
   * @param token - The token string itself.
   * @param iat - Issued At timestamp (optional).
   * @param exp - Expiration timestamp (optional).
   * @param username - Username of the user associated with the token (optional).
   */
  constructor(
    public userUID: string,
    public token: string,
    public iat?: number,
    public exp?: number,
    public username?: string,
  ) { this.uid = token; }
}