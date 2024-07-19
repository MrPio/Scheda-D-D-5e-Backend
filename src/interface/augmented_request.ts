import { CachedToken } from '../model/cached_token';
import { Request } from 'express';
import { Session } from '../model/session';

export interface IAugmentedRequest extends Request {
  requestTime?: number;
  token?: string;
  decodedToken?: CachedToken;
  sessionId?: string;
  userUID?: string;
  addresseeUIDs?: string[];
  session?: Session;
}