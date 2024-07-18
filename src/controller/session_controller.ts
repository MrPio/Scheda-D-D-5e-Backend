import { AugmentedRequest } from '../api';
import { Response as Res } from 'express';
import { createSessionService, deleteSessionService, getAllSessionsService, getSessionInfoService, pauseSessionService, startSessionService, stopSessionService } from '../service/session_service';
import { getTurnService, postponeTurnService, endTurnService } from '../service/turn_service';
import { getHistoryService, updateHistoryService } from '../service/history_service';
import { diceRollService } from '../service/attack_service';


export const getSessions = (req: AugmentedRequest, res: Res) => {
  return getAllSessionsService(req, res);
};

export const createSession = (req: AugmentedRequest, res: Res) => {
  return createSessionService(req, res);
};

export const getSessionInfo = (req: AugmentedRequest, res: Res) => {
  return getSessionInfoService(req, res);
};

export const deleteSession = (req: AugmentedRequest, res: Res) => {
  return deleteSessionService(req, res);
};

export const startSession = (req: AugmentedRequest, res: Res) => {
  return startSessionService(req, res);
};

export const pauseSession = (req: AugmentedRequest, res: Res) => {
  return pauseSessionService(req, res);
};

export const continueSession = (req: AugmentedRequest, res: Res) => {
  return startSessionService(req, res);
};

export const stopSession = (req: AugmentedRequest, res: Res) => {
  return stopSessionService(req, res);
};

export const diceRoll = (req: AugmentedRequest, res: Res) => {
  return diceRollService(req, res);
};

export const getTurn = (req: AugmentedRequest, res: Res) => {
  return getTurnService(req, res);
};

export const postponeTurn = (req: AugmentedRequest, res: Res) => {
  return postponeTurnService(req, res);
};

export const endTurn = (req: AugmentedRequest, res: Res) => {
  return endTurnService(req, res);
};

export const getHistory = (req: AugmentedRequest, res: Res) => {
  return getHistoryService(req, res);
};

export const updateHistory = (req: AugmentedRequest, res: Res) => {
  return updateHistoryService(req, res);
};