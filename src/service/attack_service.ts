
import { Response } from 'express';
import { Dice } from '../model/dice';
import { randomInt } from 'crypto';
import { Effect } from '../model/effect';
import { RepositoryFactory } from '../repository/repository_factory';
import { Monster } from '../model/monster';
import NPC from '../model/npc';
import Character from '../model/character';
import { findEntity, findEntityTurn } from './utility/model_queries';
import { Skill } from '../model/monster_skill';
import { IAugmentedRequest } from '../interface/augmented_request';
import { EntityType } from '../model/entity';
import { httpPost } from './utility/axios_requests';
import axios from 'axios';

const repositoryFactory = new RepositoryFactory();
const sessionRepository = repositoryFactory.sessionRepository();
const monsterRepository = repositoryFactory.monsterRepository();
const characterRepository = repositoryFactory.characterRepository();
const npcRepository = repositoryFactory.npcRepository();

/**
 * This function simulates rolling a list of dice and applies a modifier to the result.
 * The dice to be rolled and the modifier are provided in the request body.
 * It calculates the total result by summing the dice rolls and adding the modifier.
 */
export async function diceRollService(req: IAugmentedRequest, res: Response) {
  const body: { diceList: string[], modifier?: number } = req.body;

  // Parse the diceList to get the numerical values of each dice
  const diceValues: number[] = body.diceList.map((dice: string) => Object(Dice)[dice]);

  // Roll each dice and compute the total result
  const rollResult = diceValues.reduce((total, dice) => total + randomInt(dice) + 1, 0) + (body.modifier ?? 0);
  return res.json({ result: rollResult });
}

export async function makeAttackService(req: IAugmentedRequest, res: Response) {
  // TODO MrPio
}

/**
 * This function calculates the results of saving throws for a list of entities within a session.
 * It checks each entity's saving throw against a difficulty class.
 * The result for each entity is computed based on its type and skill, and the results are returned.
 */
export async function getSavingThrowService(req: IAugmentedRequest, res: Response) {
  const body: { entitiesId: string[], difficultyClass: number, skill: Skill } = req.body;
  const diceRollReq: { diceList: Dice[], addresseeUIDs: string[], modifiers: number[] } = { diceList: [Dice.d20], addresseeUIDs: [], modifiers: [] };

  // Determine the modifier for each adressee entity.
  for (const entityId of body.entitiesId) {
    const entity = await findEntity(req.session!, entityId);
    diceRollReq.modifiers.push((entity?.entityType == EntityType.monster ?
      (entity.entity as Monster).skills.find(it => it.skill == body.skill)?.value :
      (entity?.entity as Character | NPC).skillsModifier[body.skill]) ?? 0);
    diceRollReq.addresseeUIDs.push(entity!.entity.authorUID);
  }

  // Send request to websocket container's API server.
  try {
    const results = (await httpPost(`/sessions/${req.sessionId!}/requestDiceRoll`, diceRollReq)) as { data: { [key: string]: { diceRoll: number } } };
    const response: { [key: string]: boolean } = {};
    for (const result of Object.entries(results.data))
      response[result[0]] = result[1].diceRoll >= body.difficultyClass;
    return res.json(response);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response)
      return res.json(error.response.data);
  }
}

// TODO MrPio
// TODO broadcast an History Message at the end of some routes
export async function addEffectService(req: IAugmentedRequest, res: Response) {
  const { sessionId } = req.params;
  const { entitiesId, effect } = req.body;

  // Ensure the effect is valid or null
  if (effect !== null && !Object.values(Effect).includes(effect)) {
    return res.status(400).json({ error: 'Invalid effect' });
  }

  // Retrieve the session
  const session = await sessionRepository.getById(sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // Check if entitiesId is provided and convert to array if necessary
  const entitiesIdArray = Array.isArray(entitiesId) ? entitiesId : [entitiesId];

  // Prepare arrays to hold updated entities
  const updatedMonsters: Monster[] = [];
  const updatedNPCs: NPC[] = [];
  const updatedCharacters: Character[] = [];

  // Loop through entitiesId to update effects
  // for (const entityId of entitiesIdArray) {
  //   let updatedEntity: Monster | NPC | Character | null = null;

  //   // Check if entityId corresponds to a Monster
  //   const monsterUID = session.monsterUIDs?.find(m => m == entityId);
  //   if (monsterUID) {
  //     const monster = session.monsters.find(m => m.id == monsterUID);
  //     // TODO...
  //     updatedEntity = await monsterRepository.update(monster.id, { effects: monster.effects }) as Monster;
  //     updatedMonsters.push(updatedEntity);
  //     continue;
  //   }

  //   // Check if entityId corresponds to an NPC
  //   const npc = session.npcUIDs?.find(n => n.id === entityId);
  //   if (npc) {
  //     npc.effects = effect !== null ? [effect] : [];
  //     updatedEntity = await npcRepository.update(npc.id, { effects: npc.effects }) as NPC;
  //     updatedNPCs.push(updatedEntity);
  //     continue;
  //   }

  //   // Check if entityId corresponds to a Character
  //   const character = session.characterUIDs?.find(c => c.id === entityId);
  //   if (character) {
  //     character.effects = effect !== null ? [effect] : [];
  //     updatedEntity = await characterRepository.update(character.id, { effects: character.effects }) as Character;
  //     updatedCharacters.push(updatedEntity);
  //     continue;
  //   }

  //   return res.status(404).json({ error: `Entity with id ${entityId} not found in session` });
  // }

  // return res.status(200).json({
  //   message: `Effect ${effect !== null ? effect : 'cleared'} updated for entities`,
  //   updatedMonsters,
  //   updatedNPCs,
  //   updatedCharacters,
  // });
}

/**
 * This function enables the reaction ability for a specified entity within a session.
 * The session and entity are identified by the sessionId and entityId provided in 
 * the request parameters and body.
 * It updates the entity's `isReactionActivable` property and saves the changes.
 */
export async function enableReactionService(req: IAugmentedRequest, res: Response) {
  const { sessionId } = req.params;
  const { entityId } = req.body;

  const session = await sessionRepository.getById(sessionId);

  // Find the entity in the entityTurns list
  const entityTurn = findEntityTurn(session!, entityId);
  if (entityTurn) {
    let entity;

    // Check if the entity is a monster, character, or NPC
    if (session!.monsterUIDs.includes(entityId)) {
      entity = await monsterRepository.getById(entityId);
    } else if (session!.characterUIDs!.includes(entityId)) {
      entity = await characterRepository.getById(entityId);
    } else if (session!.npcUIDs!.includes(entityId)) {
      entity = await npcRepository.getById(entityId);
    }

    if (entity) {
      // Update the entity's isReactionActivable property to false
      entity.isReactionActivable = false;

      // Save the updated entity back to its repository
      if (entity instanceof Monster) {
        await monsterRepository.update(entity.id, { isReactionActivable: entity.isReactionActivable });
      } else if (entity instanceof Character) {
        await characterRepository.update(entity.uid!, { isReactionActivable: entity.isReactionActivable });
      } else if (entity instanceof NPC) {
        await npcRepository.update(entity.uid!, { isReactionActivable: entity.isReactionActivable });
      }

      return res.status(200).json({ message: `Reaction enabled for entity ${entityId}!` });
    }
  }

  // Return error if the entity is not found in the session
  return res.status(404).json({ error: `Entity not found in session ${sessionId}!` });
}

