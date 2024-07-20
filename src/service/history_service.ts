
import { Response as Res } from 'express';
import { RepositoryFactory } from '../repository/repository_factory';
import { HistoryMessage } from '../model/history_message';
import { StatusCodes } from 'http-status-codes';
import { IAugmentedRequest } from '../interface/augmented_request';

const sessionRepository = new RepositoryFactory().sessionRepository();
const historyRepository = new RepositoryFactory().historyRepository();

/**
 * This function retrieves the history of a session based on the sessionId from the request parameters.
 * If an actionType is specified in the request body, it filters the history to return
 * only messages of that type.
 */
export async function getHistoryService(req: IAugmentedRequest, res: Res) {
  const { sessionId } = req.params;
  const { actionType } = req.body;

  // Retrieve the session with its history relationship
  const session = await sessionRepository.getById(sessionId);

  // Check if actionType is specified
  if (actionType) {
    // Filter history by actionType
    const filteredHistory = session!.history.filter(item => item.actionType === actionType);
    // Return the filtered history
    return res.status(200).json(filteredHistory);
  }

  // Return the complete history if no actionType is specified
  return res.status(200).json(session?.history);
}

/**
 * This function updates the history of a session by adding a new message.
 * It retrieves the session using the sessionId from the request parameters.
 * The new message, along with its actionType, is then created and saved to the history.
 */
export async function updateHistoryService(req: IAugmentedRequest, res: Res) {
  const { sessionId } = req.params;
  const { msg, actionType } = req.body;

  const session = await sessionRepository.getById(sessionId);

  // Create and save the new history message
  await historyRepository.create({
    msg,
    actionType,
    sessionId: session?.id,
  } as HistoryMessage);

  return res.status(StatusCodes.CREATED).json({ message: 'Message created successfully!' });
}