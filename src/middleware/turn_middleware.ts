import { Response, NextFunction } from 'express';
import { EntityTurn } from '../model/entity_turn';
import { Error400Factory, Error500Factory } from '../error/error_factory';
import { IAugmentedRequest } from '../interface/augmented_request';

const error400Factory = new Error400Factory();
const error500Factory = new Error500Factory();

/**
 * Check if the the entity can start his turn after another entity
 * @precondition `checkSessionExists`
 * @precondition `checkEntityExistsInSession`
 */
export const checkPostponeTurn = async (req: IAugmentedRequest, res: Response, next: NextFunction) => {
  const body: { predecessorEntityId: string } = req.body;

  // Check that the `predecessorEntityId` is not the current player.
  if (body.predecessorEntityId === req.entityId)
    return error400Factory.genericError('The postponed entity must specify a valid predecessor entity').setStatus(res);

  // Check if it's the turn of `entityId`
  if (req.session!.currentEntityUID !== req.entityId)
    return error400Factory.notYourTurn(req.entity!._name).setStatus(res);

  // Check that the provided `predecessorEntityId` belongs to a player of the given session.
  if ([req.session?.characterUIDs, req.session?.npcUIDs, req.session?.monsterUIDs].every(it => !it?.includes(body.predecessorEntityId!)))
    return error400Factory.entityNotFoundInSession(body.predecessorEntityId, req.sessionId!).setStatus(res);

  // Check that session contains the required entities turns. This should always be true.
  const entityUIDsInTurn = req.session!.entityTurns.map((turn: EntityTurn) => turn.entityUID);
  if (!entityUIDsInTurn.includes(req.entityId!) || !entityUIDsInTurn.includes(body.predecessorEntityId))
    return error500Factory.genericError().setStatus(res);

  next();
};

/**
 * Check if the entity can end his turn.
 * @precondition `checkSessionExists`
 * @precondition `checkEntityExistsInSession`
 */
export const checkEndTurn = async (req: IAugmentedRequest, res: Response, next: NextFunction) => {
  if (req.session!.currentEntityUID !== req.entityId)
    return error400Factory.notYourTurn(req.entity!._name).setStatus(res);

  next();
};