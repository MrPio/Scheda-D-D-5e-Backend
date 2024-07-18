import { IAugmentedRequest } from '../api';
import { Response as Res } from 'express';
import { addEntityService, deleteEntityService, getEntityInfoService, updateEntityInfoService } from '../service/entity_service';
import { getSavingThrowService, makeAttackService, addEffectService, enableReactionService } from '../service/attack_service';

export const addEntity = (req: IAugmentedRequest, res: Res) => {
  return addEntityService(req, res);
};

//export const getMonsterInfo = (req: AugmentedRequest, res: Res) => {
//  return getMonsterInfoService(req, res);
//};

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