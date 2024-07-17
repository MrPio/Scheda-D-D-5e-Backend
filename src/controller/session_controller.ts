import { RequestWithToken } from '../api';
import { Response as Res } from 'express';
import { continueSessionService, createSessionService, deleteSessionService, getAllSessionsService, getSessionInfoService, pauseSessionService, startSessionService, stopSessionService } from '../service/session_service';
import { getTurnService, postponeTurnService, endTurnService } from '../service/turn_service';
import { getHistoryService, updateHistoryService } from '../service/history_service';
import { diceRollService } from '../service/dice_service';


export const getSessions = (req: RequestWithToken, res: Res) => {
  return getAllSessionsService(req, res);
};

export const createSession = (req: RequestWithToken, res: Res) => {
  return createSessionService(req, res);
};

export const getSessionInfo = (req: RequestWithToken, res: Res) => {
  return getSessionInfoService(req, res);
};

export const deleteSession = (req: RequestWithToken, res: Res) => {
  return deleteSessionService(req, res);
};

export const startSession = (req: RequestWithToken, res: Res) => {
  return startSessionService(req, res);
};

export const pauseSession = (req: RequestWithToken, res: Res) => {
  return pauseSessionService(req, res);
};

export const continueSession = (req: RequestWithToken, res: Res) => {
  return continueSessionService(req, res);
};

export const stopSession = (req: RequestWithToken, res: Res) => {
  return stopSessionService(req, res);
};

export const diceRoll = (req: RequestWithToken, res: Res) => {
  return diceRollService(req, res);
};

export const getTurn = (req: RequestWithToken, res: Res) => {
  return getTurnService(req, res);
};

export const postponeTurn = (req: RequestWithToken, res: Res) => {
  return postponeTurnService(req, res);
};

export const endTurn = (req: RequestWithToken, res: Res) => {
  return endTurnService(req, res);
};

export const getHistory = (req: RequestWithToken, res: Res) => {
  return getHistoryService(req, res);
};

export const updateHistory = (req: RequestWithToken, res: Res) => {
  return updateHistoryService(req, res);
};