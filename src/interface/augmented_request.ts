import { CachedToken } from '../model/cached_token';
import { Request } from 'express';
import { Session } from '../model/session';

/**
 * Extends the default Express `Request` interface to include additional properties
 * that are useful for handling requests in the context of this application.
 * 
 * This interface augments the standard request object with properties related to
 * request timing, authentication tokens, session management, and user information.
 */
export interface IAugmentedRequest extends Request {
  requestTime?: number;
  token?: string;
  decodedToken?: CachedToken;
  sessionId?: string;
  userUID?: string;
  addresseeUIDs?: string[];
  session?: Session;
}