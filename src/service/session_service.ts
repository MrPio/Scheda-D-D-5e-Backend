import { AugmentedRequest } from '../api';
import { Response as Res } from 'express';
import { RepositoryFactory } from '../repository/repository_factory';
import { Session, SessionStatus } from '../model/session';

const sessionRepository = new RepositoryFactory().sessionRepository();

export async function getAllSessionsService(req: AugmentedRequest, res: Res) {
  const sessions = await sessionRepository.getAll();
  res.status(200).json(sessions);
  return;
}
  
export async function createSessionService(req: AugmentedRequest, res: Res) {
  const body = req.body;

  const newSession = await sessionRepository.create({
    name: body.name,
    masterUID: body.masterUID,
    entityUIDs: body.entityUIDs,
    campaignName: body.campaignName,
    currentEntityUID: body.currentEntityUID,
    sessionStatus: SessionStatus.created,
  } as Session);

  res.status(200).json(newSession);
}

export async function getSessionInfoService(req: AugmentedRequest, res: Res) {
  const { sessionId } = req.params;
  const session = await sessionRepository.getById(sessionId);
  res.status(200).json(session);
  return;
}

export async function deleteSessionService(req: AugmentedRequest, res: Res) {
  const { sessionId } = req.params;
  await sessionRepository.delete(sessionId);
  res.status(200).send(`Session ${sessionId} deleted succesfully!`);
  return;
}

export async function startSessionService(req: AugmentedRequest, res: Res) {
  const { sessionId } = req.params;
  const session = await sessionRepository.getById(sessionId);
  await sessionRepository.update(session?.id, { sessionStatus: SessionStatus.ongoing });
  res.status(200).send(`Session ${sessionId} started succesfully!`);
  return;
}

export async function pauseSessionService(req: AugmentedRequest, res: Res) {
  const { sessionId } = req.params;
  const session = await sessionRepository.getById(sessionId);
  await sessionRepository.update(session?.id, { sessionStatus: SessionStatus.paused });
  res.status(200).send(`Session ${sessionId} paused succesfully!`);
  return;
}

export async function continueSessionService(req: AugmentedRequest, res: Res) {
  const { sessionId } = req.params;
  const session = await sessionRepository.getById(sessionId);
  await sessionRepository.update(session?.id, { sessionStatus: SessionStatus.ongoing });
  res.status(200).send(`Session ${sessionId} continued succesfully!`);
  return;
}

export async function stopSessionService(req: AugmentedRequest, res: Res) {
  const { sessionId } = req.params;
  const session = await sessionRepository.getById(sessionId);
  await sessionRepository.update(session?.id, { sessionStatus: SessionStatus.ended });
  res.status(200).send(`Session ${sessionId} ended succesfully!`);
  return;
}