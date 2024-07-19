import { Request, Response, NextFunction } from 'express';
import { RepositoryFactory } from '../repository/repository_factory';
import { SessionStatus } from '../model/session';

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
  if (!isValidMapSize()) {
    return res.status(400).json({
      error: `Map size is invalid. Width must be between ${minMapWidth} and ${maxMapWidth}, and height must be between ${minMapHeight} and ${maxMapHeight}.` });
  }

  // Helper function to check if the input is a non-empty array of strings
  const isNonEmptyArrayOfStrings = (input: unknown): input is string[] => {
    return Array.isArray(input) && input.length > 0 && input.every(item => typeof item === 'string');
  };

  // Check if exist characters, npcs and monsters with that Id/name & there are no duplicates
  if (isNonEmptyArrayOfStrings(characters)) {
    for (const id of characters) {
      const character = await new RepositoryFactory().characterRepository().getById(id);
      if (!character) {
        return res.status(400).json({ error: `Character ${id} is not valid!` });
      }
    }

    const characterSet = new Set(characters);
    if (characterSet.size !== characters.length) {
      return res.status(400).json({ error: 'Character is already in the session!' });
    }
  }

  if (isNonEmptyArrayOfStrings(npcs)) {
    for (const id of npcs) {
      const npc = await new RepositoryFactory().npcRepository().getById(id);
      if (!npc) {
        return res.status(400).json({ error: `Npc ${id} is not valid!` });
      }
    }

    const npcSet = new Set(npcs);
    if (npcSet.size !== npcs.length) {
      return res.status(400).json({ error: 'Npc is already in the session!' });
    }
  }

  if (isNonEmptyArrayOfStrings(monsters)) {
    for (const monsterName of monsters) {
      const monster = await new RepositoryFactory().monsterRepository().getById(monsterName);
      if (!monster) {
        return res.status(400).json({ error: `Monster ${monsterName} has not yet been created` });
      }
    }

    const monsterSet = new Set(monsters);
    if (monsterSet.size !== monsters.length) {
      return res.status(400).json({ error: 'Same monster is already in the session!' });
    }
  }
  
  next();
};

/**
 * Check the validity of the sessionId
 */
export const checkSessionId = async (req: Request, res: Response, next: NextFunction) => {    

  const { sessionId } = req.params;
  const session = await new RepositoryFactory().sessionRepository().getById(sessionId);
    
  if (!session) {
    return res.status(400).json({ error: `Session ${sessionId} not found!` });
  }

  next();
};

/**
 * Check if the session is already started
 */
export const checkStartSession = async (req: Request, res: Response, next: NextFunction) => {    

  const { sessionId } = req.params;
  const session = await new RepositoryFactory().sessionRepository().getById(sessionId);
      
  if (!session) {
    return res.status(400).json({ error: `Session ${sessionId} not found!` });
  }
   
  if (session.sessionStatus !== SessionStatus.created) {
    return res.status(400).json({ error: `Session ${sessionId} already started!` });
  }
  
  next();
};

/**
 * Check if the session is paused
 */
export const checkContinueSession = async (req: Request, res: Response, next: NextFunction) => {    

  const { sessionId } = req.params;
  const session = await new RepositoryFactory().sessionRepository().getById(sessionId);
        
  if (!session) {
    return res.status(400).json({ error: `Session ${sessionId} not found!` });
  }
     
  if (session.sessionStatus !== SessionStatus.paused) {
    return res.status(400).json({ error: `Session ${sessionId} is not paused!` });
  }
    
  next();
};

/**
 * Check if the session is ongoing
 */
export const checkPauseSession = async (req: Request, res: Response, next: NextFunction) => {    

  const { sessionId } = req.params;
  const session = await new RepositoryFactory().sessionRepository().getById(sessionId);
        
  if (!session) {
    return res.status(400).json({ error: `Session ${sessionId} not found!` });
  }
     
  if (session.sessionStatus !== SessionStatus.ongoing) {
    return res.status(400).json({ error: `Session ${sessionId} is already stopped!` });
  }
    
  next();
};

/**
 * Check if the session is ended or not started
 */
export const checkStopSession = async (req: Request, res: Response, next: NextFunction) => {    

  const { sessionId } = req.params;
  const session = await new RepositoryFactory().sessionRepository().getById(sessionId);
          
  if (!session) {
    return res.status(400).json({ error: `Session ${sessionId} not found!` });
  }
       
  if (session.sessionStatus !== SessionStatus.ongoing && session.sessionStatus !== SessionStatus.paused) {
    return res.status(400).json({ error: `Session ${sessionId} is already ended or has not yet been started!` });
  }
      
  next();
};