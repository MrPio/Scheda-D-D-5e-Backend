import { Response } from 'express';
import { RepositoryFactory } from '../repository/repository_factory';
import { Session, SessionStatus } from '../model/session';
import { IAugmentedRequest } from '../interface/augmented_request';

const sessionRepository = new RepositoryFactory().sessionRepository();

/**
 * Retrieves all sessions for the authenticated user
 * and returns them in the response.
 */
export async function getAllSessionsService(req: IAugmentedRequest, res: Response) {
  const sessions = await sessionRepository.getAll();
  return res.status(200).json(sessions);
}

/**
 * Creates a new session using the details provided in the request body.
 * Sets the initial status of the session to "created".
 */
export async function createSessionService(req: IAugmentedRequest, res: Response) {
  const { name, masterUID, campaignName, mapSize } = req.body;
  await sessionRepository.create({
    name,
    masterUID,
    campaignName,
    sessionStatus: SessionStatus.created,
    mapSize,
  } as Session);
  return res.status(200).json({ message: 'Session created successfully!' });
}

/**
 * Retrieves session information based on the sessionId 
 * provided in the request parameters.
 */
export async function getSessionInfoService(req: IAugmentedRequest, res: Response) {
  return res.status(200).json(req.session!);
}

/**
 * Deletes a session based on the sessionId 
 * provided in the request parameters.
 */
export async function deleteSessionService(req: IAugmentedRequest, res: Response) {
  await sessionRepository.delete(req.sessionId!);
  return res.status(200).json({ message: `Session ${req.session!.name} deleted successfully!` });
}

/**
 * Starts a session by updating its status to "ongoing".
 * The sessionId is provided in the request parameters.
 */
export async function startSessionService(req: IAugmentedRequest, res: Response) {
  await sessionRepository.update(req.sessionId!, { sessionStatus: SessionStatus.ongoing });
  return res.status(200).json({ message: `Session ${req.session!.name} started successfully!` });
}

/**
 * Pauses a session by updating its status to "paused".
 * The sessionId is provided in the request parameters.
 */
export async function pauseSessionService(req: IAugmentedRequest, res: Response) {
  await sessionRepository.update(req.sessionId!, { sessionStatus: SessionStatus.paused });
  return res.status(200).json({ message: `Session ${req.session!.name} paused successfully!` });
}

/**
 * Stops a session by updating its status to "ended".
 * The sessionId is provided in the request parameters.
 */
export async function stopSessionService(req: IAugmentedRequest, res: Response) {
  await sessionRepository.update(req.sessionId!, { sessionStatus: SessionStatus.ended });
  return res.status(200).json({ message: `Session ${req.session!.name} stopped successfully!` });
}