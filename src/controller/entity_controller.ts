import { RequestWithToken } from "../api";
import {Response as Res} from 'express';
import { addEffectService, addEntityService, addMonsterService, deleteEntityService, enableReactionService, getEntityInfoService, getMonsterInfoService, updateEntityInfoService } from "../service/entity_service";
import { getSavingThrowService, makeAttackService } from "../service/dice_service";

export const addEntity = (req: RequestWithToken, res: Res) => {
    return addEntityService(req, res);
};

export const getMonsterInfo = (req: RequestWithToken, res: Res) => {
    return getMonsterInfoService(req, res);
};

export const addMonster = (req: RequestWithToken, res: Res) => {
    return addMonsterService(req, res);
};

export const deleteEntity = (req: RequestWithToken, res: Res) => {
    return deleteEntityService(req, res);
};

export const makeAttack = (req: RequestWithToken, res: Res) => {
    return makeAttackService(req, res);
};

export const getSavingThrow = (req: RequestWithToken, res: Res) => {
    return getSavingThrowService(req, res);
};

export const addEffect = (req: RequestWithToken, res: Res) => {
    return addEffectService(req, res);
};

export const getEntityInfo = (req: RequestWithToken, res: Res) => {
    return getEntityInfoService(req, res);
};

export const updateEntityInfo = (req: RequestWithToken, res: Res) => {
    return updateEntityInfoService(req, res);
};

export const enableReaction = (req: RequestWithToken, res: Res) => {
    return enableReactionService(req, res);
};