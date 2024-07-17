import { Request, Response, NextFunction } from 'express';
import { RepositoryFactory } from '../repository/repository_factory';
import { SessionStatus } from '../model/session';

//how to verify the sizeMap??
// Check if the entities exist before the creation of a session
export const createSession = async (req: Request, res: Response, next: NextFunction) => {

  const { characters, npcs, monsters /*,mapSize*/ } = req.query;

  // Check the number of the entities
  if (!characters && !npcs && !monsters) {
    return res.status(400).json({ error: 'you need to add at least 1 entity' });
  }

  // Check if exist characters, npcs and monsters with that Id/name & there are not duplicates
  if (!characters) {
    for (const id of characters) {
      const allCharacters = await new RepositoryFactory().characterRepository().getById(id);
      if (!allCharacters) {
        return res.status(400).json({ error: `the character ${id} is not valid` });
      }
    }

    const characterSet = new Set(characters);
    if (characterSet.size !== characters.length) {
      return res.status(400).json({ error: 'there is a repetition of the same character' });
    }
  }

  if (!npcs) {
    for (const id of npcs) {
      const allNpcs = await new RepositoryFactory().npcRepository().getById(id);
      if (!allNpcs) {
        return res.status(400).json({ error: `the npc ${id} is not valid` });
      }
    }

    const npcSet = new Set(npcs);
    if (npcSet.size !== npcs.length) {
      return res.status(400).json({ error: 'there is a repetition of the same npc' });
    }
  }

  if (!monsters) {
    for (const name of monsters) {
      const allMonsters = await new RepositoryFactory().monsterRepository().getById(name);
      if (!allMonsters) {
        return res.status(400).json({ error: `the monster ${name} has not yet been created` });
      }
    }
    
    const monsterSet = new Set(monsters);
    if (monsterSet.size !== monsters.length) {
      return res.status(400).json({ error: 'there is a repetition of the same monster' });
    }
  }
  
  next();
};

// Check if the sessionId is valid
export const getSession = async (req: Request, res: Response, next: NextFunction) => {    

  const { sessionId } = req.query;
  const sessionID = String(sessionId);
  const session = await new RepositoryFactory().sessionRepository().getById(sessionID);
    
  if (!session) {
    return res.status(400).json({ error: `the session ${sessionID} is not found` });
  }

  next();
};

// Check if the session is already started
export const startSession = async (req: Request, res: Response, next: NextFunction) => {    

  const { sessionId } = req.query;
  const sessionID = String(sessionId);
  const session = await new RepositoryFactory().sessionRepository().getById(sessionID);
      
  if (!session) {
    return res.status(400).json({ error: `the session ${sessionID} is not found` });
  }
   
  if (session.sessionStatus !== SessionStatus.created) {
    return res.status(400).json({ error: 'the session is already started' });
  }
  
  next();
};

// Check if the session is paused
export const continueSession = async (req: Request, res: Response, next: NextFunction) => {    

  const { sessionId } = req.query;
  const sessionID = String(sessionId);
  const session = await new RepositoryFactory().sessionRepository().getById(sessionID);
        
  if (!session) {
    return res.status(400).json({ error: `the session ${sessionID} is not found` });
  }
     
  if (session.sessionStatus !== SessionStatus.paused) {
    return res.status(400).json({ error: 'the session is not paused' });
  }
    
  next();
};

// Check if the session is already started
export const pauseSession = async (req: Request, res: Response, next: NextFunction) => {    

  const { sessionId } = req.query;
  const sessionID = String(sessionId);
  const session = await new RepositoryFactory().sessionRepository().getById(sessionID);
        
  if (!session) {
    return res.status(400).json({ error: `the session ${sessionID} is not found` });
  }
     
  if (session.sessionStatus !== SessionStatus.ongoing) {
    return res.status(400).json({ error: 'the session is already stopped' });
  }
    
  next();
};

// Check if the session is already started
export const stopSession = async (req: Request, res: Response, next: NextFunction) => {    

  const { sessionId } = req.query;
  const sessionID = String(sessionId);
  const session = await new RepositoryFactory().sessionRepository().getById(sessionID);
          
  if (!session) {
    return res.status(400).json({ error: `the session ${sessionID} is not found` });
  }
       
  if (session.sessionStatus !== SessionStatus.ongoing && session.sessionStatus !== SessionStatus.paused) {
    return res.status(400).json({ error: 'the session has either already ended or has not yet been started' });
  }
      
  next();
};