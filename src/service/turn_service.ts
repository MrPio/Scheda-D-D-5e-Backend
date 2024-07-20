
import { Response as Res } from 'express';
import { RepositoryFactory } from '../repository/repository_factory';
import { findEntityTurn } from './utility/model_queries';

const sessionRepository = new RepositoryFactory().sessionRepository();

// TODO: rivedere alla luce di una nuova gestione dell'ordine dei turni

export async function getTurnService(req: IAugmentedRequest, res: Res) {
  const { sessionId } = req.params;
  const session = await sessionRepository.getById(sessionId);
  // Assume the current turn is the first in the sorted list
  const currentTurn = session?.entityTurns[0];

  // Respond with JSON containing the current turn
  return res.status(200).json({ currentTurn });
}

export async function postponeTurnService(req: IAugmentedRequest, res: Res) {
  const { sessionId } = req.params;
  const { entityId, predecessorEntityId } = req.body;

  // Retrieve the session with entityTurn relationship
  const session = await sessionRepository.getById(sessionId);

  // Find the entityTurn objects for entityId and predecessorEntityId
  const entityTurnEntity = findEntityTurn(session!, entityId);
  const predecessorEntityTurnEntity = findEntityTurn(session!, predecessorEntityId);

  // Get the positions of entityId and predecessorEntityId in the array
  const indexEntity = session!.entityTurns.indexOf(entityTurnEntity!);
  const indexPredecessor = session!.entityTurns.indexOf(predecessorEntityTurnEntity!);

  // Remove entityId's turn from its current position
  session!.entityTurns.splice(indexEntity, 1);

  // Insert entityId's turn after predecessorEntityId's turn
  const newPosition = indexPredecessor + 1;
  session!.entityTurns.splice(newPosition, 0, entityTurnEntity!);

  // Update session in the database
  await sessionRepository.update(session!.id, { entityTurns: session!.entityTurns });

  return res.status(200).json({ message: `Turn of entity ${entityId} postponed after entity ${predecessorEntityId}` });
}

export async function endTurnService(req: IAugmentedRequest, res: Res) {
  // TODO: impostare currentUid e ordinare lista, in entityTurn[0]=newCurrentUid
  // impostare anche reazione da false a true
}