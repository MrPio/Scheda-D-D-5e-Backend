import { Request, Response, NextFunction } from 'express';
import { RepositoryFactory } from '../repository/repository_factory';
import { EntityTurn } from '../model/entity_turn';

// TODO: rivedere alla luce di una nuova gestione dell'ordine dei turni

/**
 * Check if the the entity can end his turn
 */
export const checkEndTurn = async (req: Request, res: Response, next: NextFunction) => {

  const { sessionId } = req.params;
  const { entityId } = req.body;
  const session = await new RepositoryFactory().sessionRepository().getById(sessionId);

  // Extract the entityUIDs from the entityTurn objects
  const entityUIDsInTurn = session!.entityTurns.map((turn: EntityTurn) => turn.entityUID);

  if (!entityUIDsInTurn.includes(entityId)) {
    return res.status(400).json({ error: `Entity ${entityId} is not found in the turn of the session!` });
  }

  if (session!.currentEntityUID !== entityId) { 
    return res.status(400).json({ error: `It's not the turn of ${entityId}!` });
  }

  next();
};

/**
 * Check if the the entity can start his turn after another entity
 */
export const checkPostponeTurn = async (req: Request, res: Response, next: NextFunction) => {

  const { sessionId } = req.params;
  const { entityId, predecessorEntityId } = req.body;

  const session = await new RepositoryFactory().sessionRepository().getById(sessionId);

  // Extract the entityUIDs from the entityTurn objects
  const entityUIDsInTurn = session!.entityTurns.map((turn: EntityTurn) => turn.entityUID);

  if (!entityUIDsInTurn.includes(entityId)) {
    return res.status(400).json({ error: `Entity ${entityId} not found in turn of the session ${sessionId}!` });
  }

  if (!entityUIDsInTurn.includes(predecessorEntityId)) {
    return res.status(400).json({ error: `Entity ${predecessorEntityId} not found in turn of the session ${sessionId}!` });
  }

  if (session!.currentEntityUID !== entityId) { 
    return res.status(400).json({ error: `It's not the turn of ${entityId}!` });
  }
  
  // Check if the two ids are not the same and if it is possible to postpone the shift 
  const indexEntity = entityUIDsInTurn.indexOf(entityId); 
  const indexPredecessor = entityUIDsInTurn.indexOf(predecessorEntityId);

  if (indexEntity === indexPredecessor) {
    return res.status(400).json({ error: 'The two ids are identical!' });
  }

  if (indexEntity > indexPredecessor) {
    return res.status(400).json({ error: 'Turn can be postponed only after those who still have to make it!' });
  }
  
  next();
};