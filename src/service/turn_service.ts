import { AugmentedRequest } from '../api';
import { Response as Res } from 'express';
import { RepositoryFactory } from '../repository/repository_factory';
import { Session } from '../model/session';
import { EntityTurn } from '../model/entity_turn';

const sessionRepository = new RepositoryFactory().sessionRepository();

export async function getTurnService(req: AugmentedRequest, res: Res) {
  const { sessionId } = req.params;
  const session = await sessionRepository.getById(sessionId);
  // Assume the current turn is the first in the sorted list
  const currentTurn = session?.entityTurn[0];

  // Respond with JSON containing the current turn
  res.status(200).json({ currentTurn });
  return;
}

// TODO: rimuovere controlli e usare middleware
export async function postponeTurnService(req: AugmentedRequest, res: Res) {
  const { sessionId } = req.params;
  const { entityId, predecessorEntityId } = req.body;
  
  // Retrieve the session with entityTurn relationship
  const session = await sessionRepository.getById(sessionId);
    
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  // Find the entityTurn objects for entityId and predecessorEntityId
  const entityTurnEntity = findEntityTurn(session, entityId);
  const predecessorEntityTurnEntity = findEntityTurn(session, predecessorEntityId);
    
  if (!entityTurnEntity || !predecessorEntityTurnEntity) {
    return res.status(404).json({ error: 'Entity turn not found in session' });
  }
    
  // Get the positions of entityId and predecessorEntityId in the array
  const indexEntity = session.entityTurn.indexOf(entityTurnEntity);
  const indexPredecessor = session.entityTurn.indexOf(predecessorEntityTurnEntity);
    
  // Remove entityId's turn from its current position
  session.entityTurn.splice(indexEntity, 1);
    
  // Insert entityId's turn after predecessorEntityId's turn
  const newPosition = indexPredecessor + 1;
  session.entityTurn.splice(newPosition, 0, entityTurnEntity);
    
  // Update session in the database
  await sessionRepository.update(session.id, { entityTurn: session.entityTurn });
    
  res.status(200).json({ message: `Turn of entity ${entityId} postponed after entity ${predecessorEntityId}` });
}

export async function endTurnService(req: AugmentedRequest, res: Res) {
  // TODO
}
  
/**
   * Helper function to find an EntityTurn by entityUID in the session.
   * @param session The Session object containing entityTurns.
   * @param entityUID The entityUID to search for.
   * @returns The EntityTurn object if found, otherwise undefined.
   */
function findEntityTurn(session: Session, entityUID: string): EntityTurn | undefined {
  return session.entityTurn.find(turn => turn.entityUID === entityUID);
}