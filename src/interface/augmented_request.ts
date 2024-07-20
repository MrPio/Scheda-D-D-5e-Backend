import { CachedToken } from '../model/cached_token';
import { Request } from 'express';
import { Session } from '../model/session';
import Character from '../model/character';
import NPC from '../model/npc';
import { Monster } from '../model/monster';

export interface IAugmentedRequest extends Request {
  requestTime?: number;
  token?: string;
  decodedToken?: CachedToken;
  sessionId?: string;
  userUID?: string;
  addresseeUIDs?: string[];
  session?: Session | null;
  characters?: Character[];
  npcs?: NPC[];
  monsters?: Monster[];
}