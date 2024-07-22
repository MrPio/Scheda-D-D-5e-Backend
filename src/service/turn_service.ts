import { Response } from 'express';
import { RepositoryFactory } from '../repository/repository_factory';
import { findEntity, findEntityTurn, updateEntity } from './utility/model_queries';
import { IAugmentedRequest } from '../interface/augmented_request';

const entityTurnRepository = new RepositoryFactory().entityTurnRepository();

// Retrieves the current entity turn.
export async function getTurnService(req: IAugmentedRequest, res: Response) {
  return res.status(200).json(req.session?.sortedTurns[0]);
}

export async function postponeTurnService(req: IAugmentedRequest, res: Response) {
  const { predecessorEntityId } = req.body;

  // Find the entityTurn objects for entityId and predecessorEntityId
  const entityTurn = findEntityTurn(req.session!, req.entityId!);
  const predecessorTurnIndex = findEntityTurn(req.session!, predecessorEntityId)?.turnIndex;
  for (const turn of req.session!.sortedTurns)
    if (turn.turnIndex <= predecessorTurnIndex!)
      turn.turnIndex -= 1;
  entityTurn!.turnIndex = predecessorTurnIndex!;

  // Update session in the database
  req.session?.entityTurns.forEach(it => entityTurnRepository.update(it.id, { turnIndex: it.turnIndex }));
  return res.status(200).json({ message: `Turn of entity ${req.entity?._name} postponed after entity ${(await findEntity(req.session!, predecessorEntityId))?.entity._name}` });
}

export async function endTurnService(req: IAugmentedRequest, res: Response) {

  // Set the reaction of the new playing entity to activatable
  updateEntity(req.session!, req.session!.sortedTurns[0].entityUID, { isReactionActivable: true });

  // Push the current entity to the end of the turns list
  req.session!.sortedTurns[0].turnIndex = req.session!.entityTurns.length;
  for (const turn of req.session!.sortedTurns)
    turn.turnIndex -= 1;

  // Update session in the database
  req.session?.entityTurns.forEach(it => entityTurnRepository.update(it.id, { turnIndex: it.turnIndex }));
  return res.status(200).json({ message: `Turn of entity ${req.entity?._name} has ended successfully!` });
}