import { AugmentedRequest } from '../api';
import { Response as Res } from 'express';
import { RepositoryFactory } from '../repository/repository_factory';
import { HistoryMessage } from '../model/history_message';

const sessionRepository = new RepositoryFactory().sessionRepository();
const historyRepository = new RepositoryFactory().historyRepository();

export async function getHistoryService(req: AugmentedRequest, res: Res) {
  const { sessionId } = req.params;

  // Retrieve the session with history relationship
  const session = await sessionRepository.getById(sessionId);

  // Return the history
  return res.status(200).json(session?.history);
}

export async function updateHistoryService(req: AugmentedRequest, res: Res) {
  const { sessionId } = req.params;
  const { msg, actionType } = req.body;

  // Retrieve the session
  const session = await sessionRepository.getById(sessionId);

  // Create and save the new history message
  const historyMessage = await historyRepository.create({
    msg,
    actionType,
    sessionId: session?.id,
  } as HistoryMessage);

  return res.status(201).json(historyMessage);
}