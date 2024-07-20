import { Response as Res } from 'express';
import { addEntityService, deleteEntityService, getEntityInfoService, updateEntityInfoService } from '../service/entity_service';
import { getSavingThrowService, makeAttackService, addEffectService, enableReactionService } from '../service/attack_service';
import { IAugmentedRequest } from '../interface/augmented_request';

/**
 * Controller functions for handling various entity and attack-related requests.
 * These functions serve as intermediaries between the HTTP request/response cycle
 * and the corresponding service functions. They pass the request and response objects
 * to the appropriate service functions and return the results.
 */

export const addEntity = (req: IAugmentedRequest, res: Res) => {
  return addEntityService(req, res);
};

export const deleteEntity = (req: IAugmentedRequest, res: Res) => {
  return deleteEntityService(req, res);
};

export const makeAttack = (req: IAugmentedRequest, res: Res) => {
  return makeAttackService(req, res);
};

export const getSavingThrow = (req: IAugmentedRequest, res: Res) => {
  return getSavingThrowService(req, res);
};

export const addEffect = (req: IAugmentedRequest, res: Res) => {
  return addEffectService(req, res);
};

export const getEntityInfo = (req: IAugmentedRequest, res: Res) => {
  return getEntityInfoService(req, res);
};

export const updateEntityInfo = (req: IAugmentedRequest, res: Res) => {
  return updateEntityInfoService(req, res);
};

export const enableReaction = (req: IAugmentedRequest, res: Res) => {
  return enableReactionService(req, res);
};