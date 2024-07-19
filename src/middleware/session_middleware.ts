import { Request, Response, NextFunction } from 'express';
import { RepositoryFactory } from '../repository/repository_factory';
import { SessionStatus } from '../model/session';
import { Error400Factory } from '../error/error_factory';

const error400Factory: Error400Factory = new Error400Factory();

/**
 * Check the validity of creating a new session
 */
export const checkNewSession = async (req: Request, res: Response, next: NextFunction) => {

  const { mapSize, characters, npcs, monsters } = req.body;

  // Map limits
  const minMapWidth = 10;
  const minMapHeight = 10;
  const maxMapWidth = 100;
  const maxMapHeight = 100;

  // Helper function to check if mapSize is valid
  const isValidMapSize = (): boolean => {
    return (
      typeof mapSize === 'object' &&
      mapSize !== null &&
      typeof mapSize.width === 'number' &&
      typeof mapSize.height === 'number' &&
      mapSize.width >= minMapWidth &&
      mapSize.width <= maxMapWidth &&
      mapSize.height >= minMapHeight &&
      mapSize.height <= maxMapHeight
    );
  };

  // Check if mapSize is within the limits
  if (!isValidMapSize())
    return error400Factory.invalidMapSize().setStatus(res);

  // Helper function to check if the input is a non-empty array of strings
  const isNonEmptyArrayOfStrings = (input: unknown): input is string[] => {
    return Array.isArray(input) && input.length > 0 && input.every(item => typeof item === 'string');
  };

  // Check if exist characters, npcs and monsters with that Id/name & there are no duplicates
  if (isNonEmptyArrayOfStrings(characters)) {
    for (const id of characters) {
      const character = await new RepositoryFactory().characterRepository().getById(id);
      if (!character)
        return error400Factory.characterNotFound(id).setStatus(res);
    }

    const characterSet = new Set(characters);
    if (characterSet.size !== characters.length)
      return error400Factory.entityDuplicated('Character').setStatus(res);
  }

  if (isNonEmptyArrayOfStrings(npcs)) {
    for (const id of npcs) {
      const npc = await new RepositoryFactory().npcRepository().getById(id);
      if (!npc)
        return error400Factory.npcNotFound(id).setStatus(res);
    }

    const npcSet = new Set(npcs);
    if (npcSet.size !== npcs.length) 
      return error400Factory.entityDuplicated('Npc').setStatus(res);
  }

  if (isNonEmptyArrayOfStrings(monsters)) {
    for (const monsterName of monsters) {
      const monster = await new RepositoryFactory().monsterRepository().getById(monsterName);
      if (!monster)
        return error400Factory.monsterNotFound(monsterName).setStatus(res);
    }

    const monsterSet = new Set(monsters);
    if (monsterSet.size !== monsters.length)
      return error400Factory.entityDuplicated('Monster').setStatus(res);
  }
  
  next();
};

/**
 * Check the validity of the sessionId
 */
export const checkSessionId = async (req: Request, res: Response, next: NextFunction) => {    

  const { sessionId } = req.params;
  const session = await new RepositoryFactory().sessionRepository().getById(sessionId);
    
  if (!session)
    return error400Factory.sessionNotFound(sessionId).setStatus(res);

  next();
};

/**
 * Check if the session is already started
 */
export const checkStartSession = async (req: Request, res: Response, next: NextFunction) => {    

  const { sessionId } = req.params;
  const session = await new RepositoryFactory().sessionRepository().getById(sessionId);
      
  if (!session)
    return error400Factory.sessionNotFound(sessionId).setStatus(res);
   
  if (session.sessionStatus !== SessionStatus.created)
    return error400Factory.sessionNotInCreatedState(sessionId).setStatus(res);
  
  next();
};

/**
 * Check if the session is paused
 */
export const checkContinueSession = async (req: Request, res: Response, next: NextFunction) => {    

  const { sessionId } = req.params;
  const session = await new RepositoryFactory().sessionRepository().getById(sessionId);
        
  if (!session)
    return error400Factory.sessionNotFound(sessionId).setStatus(res);
   
  if (session.sessionStatus !== SessionStatus.paused)
    return error400Factory.sessionNotInPausedState(sessionId).setStatus(res);
    
  next();
};

/**
 * Check if the session is ongoing
 */
export const checkPauseSession = async (req: Request, res: Response, next: NextFunction) => {    

  const { sessionId } = req.params;
  const session = await new RepositoryFactory().sessionRepository().getById(sessionId);
        
  if (!session)
    return error400Factory.sessionNotFound(sessionId).setStatus(res);
   
  if (session.sessionStatus !== SessionStatus.ongoing)
    return error400Factory.sessionNotInOngoingState(sessionId).setStatus(res);
    
  next();
};

/**
 * Check if the session is ended or not started
 */
export const checkStopSession = async (req: Request, res: Response, next: NextFunction) => {    

  const { sessionId } = req.params;
  const session = await new RepositoryFactory().sessionRepository().getById(sessionId);

  if (!session)
    return error400Factory.sessionNotFound(sessionId).setStatus(res);
   
  if (session.sessionStatus !== SessionStatus.ongoing && session.sessionStatus !== SessionStatus.paused)
    return error400Factory.sessionNotInStopState(sessionId).setStatus(res);
      
  next();
};