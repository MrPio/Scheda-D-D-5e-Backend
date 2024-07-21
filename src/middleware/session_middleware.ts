import { Response, NextFunction } from 'express';
import { RepositoryFactory } from '../repository/repository_factory';
import { Session, SessionStatus } from '../model/session';
import { Error400Factory } from '../error/error_factory';
import { IAugmentedRequest } from '../interface/augmented_request';
import { findEntity } from '../service/utility/model_queries';

const error400Factory = new Error400Factory();
const sessionRepository = new RepositoryFactory().sessionRepository();
const characterRepository = new RepositoryFactory().characterRepository();
const npcRepository = new RepositoryFactory().npcRepository();
const monsterRepository = new RepositoryFactory().monsterRepository();

// Check that the provided request body correctly defines a session.
export const checkNewSession = async (req: IAugmentedRequest, res: Response, next: NextFunction) => {
  const body: {
    mapSize: { width: number, height: number };
    characters: string[];
    npcs: string[];
    monsters: string[];
  } = req.body;

  // Check that mapSize is within the limits set for the map.
  if (body.mapSize.width > Session.maxMapSize.width || body.mapSize.width < Session.minMapSize.width ||
    body.mapSize.height > Session.maxMapSize.height || body.mapSize.height < Session.minMapSize.height)
    return error400Factory.invalidNumber('mapsize', 'must be between 10 and 100').setStatus(res);

  /**
   * Check that all the character, npc and monster IDs provided exist in the database. 
   * Retrieve their objects and store them in the request.
   * This is done to prevent the service from querying the repository again.
   */
  req.characters = [];
  for (const id of new Set(body.characters)) {
    const character = await characterRepository.getById(id);
    if (!character)
      return error400Factory.characterNotFound(id).setStatus(res);
    req.characters.push(character);
  }
  req.npcs = [];
  for (const id of new Set(body.npcs)) {
    const npc = await npcRepository.getById(id);
    if (!npc)
      return error400Factory.npcNotFound(id).setStatus(res);
    req.npcs.push(npc);
  }
  req.monsters = [];
  for (const id of new Set(body.monsters)) {
    const monster = await monsterRepository.getById(id);
    if (!monster)
      return error400Factory.monsterNotFound(id).setStatus(res);
    req.monsters.push(monster);
  }

  next();
};

/**
 * Check that the provided `sessionID` belongs to an existing session.
 * @postcondition `req.sessionId`, `req.session`.
 */
export const checkSessionExists = async (req: IAugmentedRequest, res: Response, next: NextFunction) => {
  req.sessionId = req.params.sessionId;

  // Check that the `sessionId` belongs to an existing session.
  req.session = (await sessionRepository.getById(req.sessionId))!;
  if (!req.session)
    return error400Factory.sessionNotFound(req.sessionId).setStatus(res);

  next();
};

/**
 * Check that the provided `entityId` belongs to a player of the given session.
 * @precondition `checkSessionExists`.
 * @postcondition `req.entityId`, `req.entity`.
 */
export const checkEntityExistsInSession = async (req: IAugmentedRequest, res: Response, next: NextFunction) => {
  req.entityId = req.params.entityId ?? req.body.entityId as string;

  // Check that the `entityId` is in the session and retrieve the object from the repository.
  const entity = await findEntity(req.session!, req.entityId!);
  if (!entity) return error400Factory.entityNotFoundInSession(req.entityId!, req.sessionId!).setStatus(res);
  req.entityType = entity.entityType;
  req.entity = entity.entity;

  next();
};

/**
 * Check if a session is in any of the specified statuses.
 * @precondition `checkSessionExists`
 * @param statuses The session's required statuses.
 * @returns A middleware that checks if the session is in any of the `statuses` statuses.
 */
export const checkSessionStatus = (statuses: SessionStatus[]) =>
  async (req: IAugmentedRequest, res: Response, next: NextFunction) => {
    if (statuses.every(it => req.session!.sessionStatus !== it))
      return error400Factory.sessionInWrongState(req.session!.name, statuses).setStatus(res);
    next();
  };