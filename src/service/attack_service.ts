
import { Response as Res } from 'express';
import { Dice } from '../model/dice';
import { randomInt } from 'crypto';
import { Effect } from '../model/effect';
import { RepositoryFactory } from '../repository/repository_factory';
import { Monster } from '../model/monster';
import NPC from '../model/npc';
import Character from '../model/character';
import { findEntityTurn } from './utility/model_queries';
import { MonsterSkill } from '../model/monster_skill';
import { IAugmentedRequest } from '../interface/augmented_request';

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
export async function diceRollService(req: IAugmentedRequest, res: Res) {
  const body: { diceList: string[], modifier?: number } = req.body;

  // Parse the diceList to get the numerical values of each dice
  const diceValues: number[] = body.diceList.map((dice: string) => Object(Dice)[dice]);

  // Roll each dice and compute the total result
  const rollResult = diceValues.reduce((total, dice) => total + randomInt(dice) + 1, 0) + (body.modifier ?? 0);
  return res.json({ result: rollResult });
}



export async function makeAttackService(req: IAugmentedRequest, res: Res) {
  // TODO MrPio
}

/**
 * This function calculates the results of saving throws for a list of entities within a session.
 * It checks each entity's saving throw against a difficulty class.
 * The result for each entity is computed based on its type and skill, and the results are returned.
 */
export async function getSavingThrowService(req: IAugmentedRequest, res: Res) {
  const { entitiesId, difficultyClass, skill } = req.body;

  // Initialize results array to store saving throw results
  const results = [];

  for (const entityId of entitiesId) {
    // Retrieve entity by ID, checking each repository
    let entity: Monster | Character | NPC | null = await monsterRepository.getById(entityId);

    if (!entity) {
      entity = await characterRepository.getById(entityId);
    }

    if (!entity) {
      entity = await npcRepository.getById(entityId);
    }

    if (entity) {
      // Roll a d20 for the saving throw
      const rollResult = randomInt(1, 20);

      let saveRoll: number;
      if (entity instanceof Monster) {
        // Get the skill value from the Monster's skills
        const monsterSkill = entity.skills.find((s: MonsterSkill) => s.skill === skill);
        saveRoll = rollResult + (monsterSkill ? monsterSkill.value : 0);
      } else if (entity instanceof Character) {
        // Get the skill modifier from the Character's skillsModifier
        saveRoll = rollResult + (entity.skillsModifier[skill] || 0);
      } else if (entity instanceof NPC) {
        // Get the skill modifier from the NPC's skillsModifier
        saveRoll = rollResult + (entity.skillsModifier[skill] || 0);
      } else {
        // Skip if entity type is unexpected
        continue;
      }

      // Determine if the saving throw is successful
      const isSuccess = saveRoll >= difficultyClass;

      // Add the result to the results array
      results.push({
        entityId,
        rollResult,
        saveRoll,
        isSuccess,
      });
    } else {
      // Return error if no entity is found
      return res.status(404).json({ error: 'Entity not found' });
    }
  }

  // Return the results of saving throws
  return res.json({ results });
}


// TODO MrPio
export async function addEffectService(req: IAugmentedRequest, res: Res) {
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
export async function enableReactionService(req: IAugmentedRequest, res: Res) {
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
        await monsterRepository.update(entity.id, entity);
      } else if (entity instanceof Character) {
        await characterRepository.update(entity.uid!, entity);
      } else if (entity instanceof NPC) {
        await npcRepository.update(entity.uid!, entity);
      }

      // Save the updated session
      await sessionRepository.update(session!.id, session!);

      return res.status(200).json({ message: `Reaction enabled for entity ${entityId}!`, entity });
    }
  }

  // Return error if the entity is not found in the session
  return res.status(404).json({ error: `Entity not found in session ${sessionId}!` });
}
