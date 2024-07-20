import { Response, NextFunction } from 'express';
import { RepositoryFactory } from '../repository/repository_factory';
import { Session, SessionStatus } from '../model/session';
import { Error400Factory } from '../error/error_factory';
<<<<<<< HEAD

const error400Factory: Error400Factory = new Error400Factory();

/**
 * Check the validity of creating a new session
 */
export const checkNewSession = async (req: Request, res: Response, next: NextFunction) => {
  const { mapSize, characters, npcs, monsters } = req.body;

  const minMapWidth = 10;
  const minMapHeight = 10;
  const maxMapWidth = 100;
  const maxMapHeight = 100;

  // Helper function to check if mapSize is valid
  const isValidMapSize = (): boolean => {
    return (
      typeof mapSize === 'object' &&
      mapSize !== null &&
      typeof mapSize.width === 'number' &&
      typeof mapSize.height === 'number' &&
      mapSize.width >= minMapWidth &&
      mapSize.width <= maxMapWidth &&
      mapSize.height >= minMapHeight &&
      mapSize.height <= maxMapHeight
    );
  };

  // Check if mapSize is within the limits
  if (!isValidMapSize())
=======
import { IAugmentedRequest } from '../interface/augmented_request';

const error400Factory = new Error400Factory();
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
>>>>>>> b284842dce05e26ef6a9cdc2e98a62ced5bf31aa
    return error400Factory.invalidMapSize().setStatus(res);

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

// Check that `sessionId` points to an existing session.
export const checkSessionId = async (req: IAugmentedRequest, res: Response, next: NextFunction) => {
  const { sessionId } = req.params;
  req.session = await new RepositoryFactory().sessionRepository().getById(sessionId);

  // Check if the session object was found in the repository.
  if (!req.session)
    return error400Factory.sessionNotFound(sessionId).setStatus(res);

  next();
};

/**
 * Check if a session is in any of the specified statuses.
 * @param statuses The session's required statuses.
 * @returns A middleware that checks if the session is in any of the `statuses` statuses.
 */
export const checkSessionStatus = (statuses: SessionStatus[]) =>
  async (req: IAugmentedRequest, res: Response, next: NextFunction) => {
    if (statuses.every(it => req.session!.sessionStatus !== it))
      return error400Factory.sessionInWrongState(req.session!.name, statuses).setStatus(res);
    next();
  };