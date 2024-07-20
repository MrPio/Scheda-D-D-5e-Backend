
import { Response as Res } from 'express';
import { createSessionService, deleteSessionService, getAllSessionsService, getSessionInfoService, pauseSessionService, startSessionService, stopSessionService } from '../service/session_service';
import { getTurnService, postponeTurnService, endTurnService } from '../service/turn_service';
import { getHistoryService, updateHistoryService } from '../service/history_service';
import { diceRollService } from '../service/attack_service';


export const getSessions = (req: IAugmentedRequest, res: Res) => {
  return getAllSessionsService(req, res);
};

export const createSession = (req: IAugmentedRequest, res: Res) => {
  return createSessionService(req, res);
};

export const getSessionInfo = (req: IAugmentedRequest, res: Res) => {
  return getSessionInfoService(req, res);
};

export const deleteSession = (req: IAugmentedRequest, res: Res) => {
  return deleteSessionService(req, res);
};

export const startSession = (req: IAugmentedRequest, res: Res) => {
  return startSessionService(req, res);
};

export const pauseSession = (req: IAugmentedRequest, res: Res) => {
  return pauseSessionService(req, res);
};

export const continueSession = (req: IAugmentedRequest, res: Res) => {
  return startSessionService(req, res);
};

export const stopSession = (req: IAugmentedRequest, res: Res) => {
  return stopSessionService(req, res);
};

export const diceRoll = (req: IAugmentedRequest, res: Res) => {
  return diceRollService(req, res);
};

export const getTurn = (req: IAugmentedRequest, res: Res) => {
  return getTurnService(req, res);
};

export const postponeTurn = (req: IAugmentedRequest, res: Res) => {
  return postponeTurnService(req, res);
};

export const endTurn = (req: IAugmentedRequest, res: Res) => {
  return endTurnService(req, res);
};

export const getHistory = (req: IAugmentedRequest, res: Res) => {
  return getHistoryService(req, res);
};

export const updateHistory = (req: IAugmentedRequest, res: Res) => {
  return updateHistoryService(req, res);
};