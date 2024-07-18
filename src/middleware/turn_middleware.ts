import { Request, Response, NextFunction } from 'express';
import { RepositoryFactory } from '../repository/repository_factory';
//import { SessionStatus } from '../model/session';

// Check if the session id valid
export const getTurn = async (req: Request, res: Response, next: NextFunction) => {    

  const { sessionId } = req.query;
  const sessionID = String(sessionId);
  const session = await new RepositoryFactory().sessionRepository().getById(sessionID);
        
  if (!session) {
    return res.status(400).json({ error: `the session ${sessionID} is not found` });
  }
    
  next();
};

// Check if the the entity can end the own turn
export const endTurn = async (req: Request, res: Response, next: NextFunction) => {

  const { sessionId, entityId } = req.query;
  const sessionID = String(sessionId);
  const entityID = String(entityId);

  const session = await new RepositoryFactory().sessionRepository().getById(sessionID);
          
  // Check if the session exist and the entityId appears in the session 
  if (!session) {
    return res.status(400).json({ error: `the session ${sessionID} is not found` });
  }

  if (!session.characterUIDs?.includes(entityID)) {
    return res.status(400).json({ error: `the entity ${entityID} is not found in the session` });
  }

  if (session.currentEntityUID !== entityId) { 
    return res.status(400).json({ error: `it is not the turn of ${entityId}` });
  }



  next();
};

// Check if the the entity can start the turn after another entity
export const postponeTurn = async (req: Request, res: Response, next: NextFunction) => {

  const { sessionId, entityId, predecessorEntityId } = req.query;
  const sessionID = String(sessionId);
  const entityID = String(entityId);
  const preEntityid = String(predecessorEntityId);

  const session = await new RepositoryFactory().sessionRepository().getById(sessionID);
       
  // Check if the session exist and the entityIds appear in the session 
  if (!session) {
    return res.status(400).json({ error: `the session ${sessionID} is not found` });
  }

  if (!session.characterUIDs?.includes(entityID)) {
    return res.status(400).json({ error: `the entity ${entityID} is not found in the session` });
  }

  if (!session.characterUIDs?.includes(preEntityid)) {
    return res.status(400).json({ error: `the entity ${preEntityid} is not found in the session` });
  }
  
  if (session.currentEntityUID !== entityId) { 
    return res.status(400).json({ error: `it is not the turn of ${entityId}` });
  }
  
  // Check if the two ids are not the same and if it is possible to postpone the shift 
  const indexEntity = session.characterUIDs.indexOf(entityID); 
  const indexPredecessor = session.characterUIDs.indexOf(preEntityid);

  if (indexEntity === indexPredecessor) {
    return res.status(400).json({ error: 'the two ids are the same' });
  }

  if (indexEntity > indexPredecessor) {
    return res.status(400).json({ error: 'you can only postpone the turn with those who have yet to start theirs' });
  }
  
  next();
};