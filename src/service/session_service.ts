import { AugmentedRequest } from '../api';
import { Response as Res } from 'express';
import { RepositoryFactory } from '../repository/repository_factory';
import { Session, SessionStatus } from '../model/session';

const sessionRepository = new RepositoryFactory().sessionRepository();

export async function getAllSessionsService(req: AugmentedRequest, res: Res) {
  const sessions = await sessionRepository.getAll();
  return res.status(200).json(sessions);  
}
  
export async function createSessionService(req: AugmentedRequest, res: Res) {
  const { name, masterUID, campaignName, currentEntityUID, mapSize } = req.body;

  const newSession = await sessionRepository.create({
    name,
    masterUID,
    campaignName,
    currentEntityUID,
    sessionStatus: SessionStatus.created,
    mapSize,
  } as Session);

  return res.status(200).json(newSession);
}

export async function getSessionInfoService(req: AugmentedRequest, res: Res) {
  const { sessionId } = req.params;
  const session = await sessionRepository.getById(sessionId);
  return res.status(200).json(session);
}

export async function deleteSessionService(req: AugmentedRequest, res: Res) {
  const { sessionId } = req.params;
  await sessionRepository.delete(sessionId);
  return res.status(200).send(`Session ${sessionId} deleted succesfully!`);
}

export async function startSessionService(req: AugmentedRequest, res: Res) {
  const { sessionId } = req.params;
  const session = await sessionRepository.getById(sessionId);
  await sessionRepository.update(session?.id, { sessionStatus: SessionStatus.ongoing });
  return res.status(200).send(`Session ${sessionId} started succesfully!`);
}

export async function pauseSessionService(req: AugmentedRequest, res: Res) {
  const { sessionId } = req.params;
  const session = await sessionRepository.getById(sessionId);
  await sessionRepository.update(session?.id, { sessionStatus: SessionStatus.paused });
  return res.status(200).send(`Session ${sessionId} paused succesfully!`);
}

export async function stopSessionService(req: AugmentedRequest, res: Res) {
  const { sessionId } = req.params;
  const session = await sessionRepository.getById(sessionId);
  await sessionRepository.update(session?.id, { sessionStatus: SessionStatus.ended });
  return res.status(200).send(`Session ${sessionId} ended succesfully!`);
}