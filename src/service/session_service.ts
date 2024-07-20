import { Response as Res } from 'express';
import { RepositoryFactory } from '../repository/repository_factory';
import { Session, SessionStatus } from '../model/session';
import { IAugmentedRequest } from '../interface/augmented_request';

const sessionRepository = new RepositoryFactory().sessionRepository();

export async function getAllSessionsService(req: IAugmentedRequest, res: Res) {
  const sessions = await sessionRepository.getAll();
  return res.status(200).json(sessions);  
}
  
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

export async function getSessionInfoService(req: IAugmentedRequest, res: Res) {
  const { sessionId } = req.params;
  const session = await sessionRepository.getById(sessionId);
  return res.status(200).json(session);
}

export async function deleteSessionService(req: IAugmentedRequest, res: Res) {
  const { sessionId } = req.params;
  await sessionRepository.delete(sessionId);
  return res.status(200).json({ message:`Session ${sessionId} deleted successfully!` });
}

export async function startSessionService(req: IAugmentedRequest, res: Res) {
  const { sessionId } = req.params;
  const session = await sessionRepository.getById(sessionId);
  await sessionRepository.update(session?.id, { sessionStatus: SessionStatus.ongoing });
  return res.status(200).json({ message:`Session ${sessionId} started successfully!` });
}

export async function pauseSessionService(req: IAugmentedRequest, res: Res) {
  const { sessionId } = req.params;
  const session = await sessionRepository.getById(sessionId);
  await sessionRepository.update(session?.id, { sessionStatus: SessionStatus.paused });
  return res.status(200).json({ message:`Session ${sessionId} paused successfully!` });
}

export async function stopSessionService(req: IAugmentedRequest, res: Res) {
  const { sessionId } = req.params;
  const session = await sessionRepository.getById(sessionId);
  await sessionRepository.update(session?.id, { sessionStatus: SessionStatus.ended });
  return res.status(200).json({ message:`Session ${sessionId} stopped successfully!` });
}