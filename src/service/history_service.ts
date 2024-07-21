
import { Response as Res } from 'express';
import { RepositoryFactory } from '../repository/repository_factory';
import { ActionType, HistoryMessage } from '../model/history_message';
import { StatusCodes } from 'http-status-codes';
import { IAugmentedRequest } from '../interface/augmented_request';

const historyRepository = new RepositoryFactory().historyRepository();

/**
 * This function retrieves the history of a session based on the sessionId from the request parameters.
 * If an actionType is specified in the request body, it filters the history to return
 * only messages of that type.
 */
export async function getHistoryService(req: IAugmentedRequest, res: Res) {
  const body: { actionType?: ActionType } = req.body;
  return res.status(200).json(req.session?.history.filter(it => !body.actionType || it.actionType == body.actionType));
}

/**
 * This function updates the history of a session by adding a new message.
 * It retrieves the session using the sessionId from the request parameters.
 * The new message, along with its actionType, is then created and saved to the history.
 */
export async function updateHistoryService(req: IAugmentedRequest, res: Res) {
  const body: { msg, actionType } = req.body;

  // Create and save the new history message
  await historyRepository.create({
    msg,
    actionType,
    sessionId: session?.id,
  } as HistoryMessage);

  return res.status(StatusCodes.CREATED).json({ message: 'Message created successfully!' });
}