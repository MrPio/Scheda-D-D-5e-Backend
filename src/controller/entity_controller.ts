import { AugmentedRequest } from '../api';
import { Response as Res } from 'express';
import { addEffectService, addEntityService, deleteEntityService, enableReactionService, getEntityInfoService, getMonsterInfoService, updateEntityInfoService } from '../service/entity_service';
import { getSavingThrowService, makeAttackService } from '../service/dice_service';

export const addEntity = (req: AugmentedRequest, res: Res) => {
  return addEntityService(req, res);
};

export const getMonsterInfo = (req: AugmentedRequest, res: Res) => {
  return getMonsterInfoService(req, res);
};

export const deleteEntity = (req: AugmentedRequest, res: Res) => {
  return deleteEntityService(req, res);
};

export const makeAttack = (req: AugmentedRequest, res: Res) => {
  return makeAttackService(req, res);
};

export const getSavingThrow = (req: AugmentedRequest, res: Res) => {
  return getSavingThrowService(req, res);
};

export const addEffect = (req: AugmentedRequest, res: Res) => {
  return addEffectService(req, res);
};

export const getEntityInfo = (req: AugmentedRequest, res: Res) => {
  return getEntityInfoService(req, res);
};

export const updateEntityInfo = (req: AugmentedRequest, res: Res) => {
  return updateEntityInfoService(req, res);
};

export const enableReaction = (req: AugmentedRequest, res: Res) => {
  return enableReactionService(req, res);
};