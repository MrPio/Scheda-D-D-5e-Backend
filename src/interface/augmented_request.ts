import { CachedToken } from '../model/cached_token';
import { Request } from 'express';
import { Session } from '../model/session';
import Character from '../model/character';
import NPC from '../model/npc';
import { Monster } from '../model/monster';
import IEntity, { EntityType } from '../model/entity';

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
  entityId?: string;
  entity?: IEntity;
  entityType?: EntityType;
  entitiesId?: string[];
  entities?: IEntity[];
  userUID?: string;
  addresseeUIDs?: string[];
  session?: Session | null;
  characters?: Character[];
  npcs?: NPC[];
  monsters?: Monster[];
}