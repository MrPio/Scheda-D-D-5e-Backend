import { Response as Res } from 'express';
import { RepositoryFactory } from '../repository/repository_factory';
import { Session, SessionStatus } from '../model/session';
import { IAugmentedRequest } from '../interface/augmented_request';

const sessionRepository = new RepositoryFactory().sessionRepository();

/**
 * Retrieves all sessions for the authenticated user
 * and returns them in the response.
 */
export async function getAllSessionsService(req: IAugmentedRequest, res: Res) {
  const sessions = await sessionRepository.getAll();
  return res.status(200).json(sessions);  
}

/**
 * Creates a new session using the details provided in the request body.
 * Sets the initial status of the session to "created".
 */
export async function createSessionService(req: IAugmentedRequest, res: Res) {
  const { name, masterUID, campaignName, mapSize } = req.body;

  sessionRepository.create({
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
export async function getSessionInfoService(req: IAugmentedRequest, res: Res) {
  const { sessionId } = req.params;
  const session = await sessionRepository.getById(sessionId);
  return res.status(200).json(session);
}

/**
 * Deletes a session based on the sessionId 
 * provided in the request parameters.
 */
export async function deleteSessionService(req: IAugmentedRequest, res: Res) {
  const { sessionId } = req.params;
  await sessionRepository.delete(sessionId);
  return res.status(200).json({ message:`Session ${sessionId} deleted successfully!` });
}

/**
 * Starts a session by updating its status to "ongoing".
 * The sessionId is provided in the request parameters.
 */
export async function startSessionService(req: IAugmentedRequest, res: Res) {
  const { sessionId } = req.params;
  const session = await sessionRepository.getById(sessionId);
  await sessionRepository.update(session?.id, { sessionStatus: SessionStatus.ongoing });
  return res.status(200).json({ message:`Session ${sessionId} started successfully!` });
}

/**
 * Pauses a session by updating its status to "paused".
 * The sessionId is provided in the request parameters.
 */
export async function pauseSessionService(req: IAugmentedRequest, res: Res) {
  const { sessionId } = req.params;
  const session = await sessionRepository.getById(sessionId);
  await sessionRepository.update(session?.id, { sessionStatus: SessionStatus.paused });
  return res.status(200).json({ message:`Session ${sessionId} paused successfully!` });
}

/**
 * Stops a session by updating its status to "ended".
 * The sessionId is provided in the request parameters.
 */
export async function stopSessionService(req: IAugmentedRequest, res: Res) {
  const { sessionId } = req.params;
  const session = await sessionRepository.getById(sessionId);
  await sessionRepository.update(session?.id, { sessionStatus: SessionStatus.ended });
  return res.status(200).json({ message:`Session ${sessionId} stopped successfully!` });
}