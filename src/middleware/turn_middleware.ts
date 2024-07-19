import { Request, Response, NextFunction } from 'express';
import { RepositoryFactory } from '../repository/repository_factory';
import { EntityTurn } from '../model/entity_turn';
import { Error400Factory } from '../error/error_factory';

const error400Factory: Error400Factory = new Error400Factory();

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

  if (!entityUIDsInTurn.includes(entityId))
    return error400Factory.entityNotFound(entityId).setStatus(res);

  if (session!.currentEntityUID !== entityId)
    return error400Factory.notYourTurn(entityId).setStatus(res);

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

  if (!entityUIDsInTurn.includes(entityId))
    return error400Factory.entityNotFound(entityId).setStatus(res);

  if (session!.currentEntityUID !== entityId)
    return error400Factory.notYourTurn(entityId).setStatus(res);

  if (!entityUIDsInTurn.includes(predecessorEntityId)) {
    return error400Factory.entityNotFound(predecessorEntityId).setStatus(res);
  }
  
  // Check if the two ids are not the same and if it is possible to postpone the shift 
  const indexEntity = entityUIDsInTurn.indexOf(entityId); 
  const indexPredecessor = entityUIDsInTurn.indexOf(predecessorEntityId);

  if (indexEntity === indexPredecessor)
    return error400Factory.identicalId().setStatus(res);

  if (indexEntity > indexPredecessor)
    return error400Factory.postponeTurn().setStatus(res);
  
  next();
};