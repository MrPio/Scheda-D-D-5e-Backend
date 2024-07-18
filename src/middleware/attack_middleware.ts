import { Request, Response, NextFunction } from 'express';
import { RepositoryFactory } from '../repository/repository_factory';
import { Effect } from '../model/effect';

//import { EntityTurn } from '../model/entity_turn';


// Checks if the entity can perform the reaction
export const enableReaction = async (req: Request, res: Response, next: NextFunction) => {

  const { sessionId, entityId } = req.query;
  const sessionID = String(sessionId);
  const entityID = String(entityId);
  
  const session = await new RepositoryFactory().sessionRepository().getById(sessionID);
            
  // Check if the session exist and the entityId appears in the session 
  if (!session) {
    return res.status(400).json({ error: `the session ${sessionID} is not found` });
  }

  let player;
  
  if (session.characterUIDs?.includes(entityID)) {
    player = await new RepositoryFactory().characterRepository().getById(sessionID);
  } else if (session.npcUIDs?.includes(entityID)) {
    player = await new RepositoryFactory().npcRepository().getById(sessionID);
  } else if (session.monsterUIDs?.includes(entityID)) {
    player = await new RepositoryFactory().monsterRepository().getById(sessionID);  
  } else {
    return res.status(400).json({ error: `the entity ${entityID} is not found` }); 
  }

  // Check if the reaction is activable for the entity
  if (!player?.isReactionActivable) {
    return res.status(400).json({ error: `the entity ${entityID} has already used its reaction.` }); 
  }

  
  next();
};

// checks if these effects can be assigned to the entity
export const giveEffects = async (req: Request, res: Response, next: NextFunction) => {

  const { sessionId, entityId, effect } = req.query;

  const validEffect = Object.values(Effect) as string[];
  const sessionID = String(sessionId);
  const entityID = String(entityId);
  
  const session = await new RepositoryFactory().sessionRepository().getById(sessionID);
            
  // Check if the session exist and the entityId appears in the session 
  if (!session) {
    return res.status(400).json({ error: `the session ${sessionID} is not found` });
  }

  if (!session.characterUIDs?.includes(entityID) && !session.npcUIDs?.includes(entityID) && !session.monsterUIDs?.includes(entityID) ) {
    return res.status(400).json({ error: `the entity ${entityID} is not found` }); 
  }

  // Check if the element is a valid value based on the enum Effect and the effect list is not null. 
  if (effect) {
    for (const element of effect as string[]) {
      if (!validEffect.includes(element)) {
        return res.status(400).json({ error: `Invalid effect in the list: ${element}. The effect must be one of the following values: ${validEffect.join(', ')}.` });
      }
    }
  }

  next();
};

export const tryAttack = async (req: Request, res: Response, next: NextFunction) => {

  next();
};

export const requestSavingThrow = async (req: Request, res: Response, next: NextFunction) => {

  next();
};