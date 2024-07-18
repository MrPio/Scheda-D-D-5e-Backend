import { IAugmentedRequest } from '../api';
import { Response as Res } from 'express';
import { Dice } from '../model/dice';
import { randomInt } from 'crypto';
import { Effect } from '../model/effect';
import { RepositoryFactory } from '../repository/repository_factory';
import { Monster } from '../model/monster';
import NPC from '../model/npc';
import Character from '../model/character';

const repositoryFactory = new RepositoryFactory();
const sessionRepository = repositoryFactory.sessionRepository();
const monsterRepository = repositoryFactory.monsterRepository();


export async function diceRollService(req: IAugmentedRequest, res: Res) {
  const { diceList, modifier } = req.body;

  // Parse diceList
  const diceValues: number[] = diceList.map((dice: string) => Object(Dice)[dice]);

  // Roll the dice
  const rollResult = diceValues.reduce((total, dice) => total + randomInt(dice) + 1, 0) + modifier;
  return res.json({ result: rollResult });
}


export async function makeAttackService(req: IAugmentedRequest, res: Res) {
  // TODO
}

export async function getSavingThrowService(req: IAugmentedRequest, res: Res) {
  // TODO
}

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
  for (const entityId of entitiesIdArray) {
    let updatedEntity: Monster | NPC | Character | null = null;

    // Check if entityId corresponds to a Monster
    const monsterUID = session.monsterUIDs?.find(m => m == entityId);
    if (monsterUID) {
      const monster = session.monsters.find(m => m.id == monsterUID);
      // TODO...
      updatedEntity = await monsterRepository.update(monster.id, { effects: monster.effects }) as Monster;
      updatedMonsters.push(updatedEntity);
      continue;
    }

    // Check if entityId corresponds to an NPC
    const npc = session.npcUIDs?.find(n => n.id === entityId);
    if (npc) {
      npc.effects = effect !== null ? [effect] : [];
      updatedEntity = await npcRepository.update(npc.id, { effects: npc.effects }) as NPC;
      updatedNPCs.push(updatedEntity);
      continue;
    }

    // Check if entityId corresponds to a Character
    const character = session.characterUIDs?.find(c => c.id === entityId);
    if (character) {
      character.effects = effect !== null ? [effect] : [];
      updatedEntity = await characterRepository.update(character.id, { effects: character.effects }) as Character;
      updatedCharacters.push(updatedEntity);
      continue;
    }

    return res.status(404).json({ error: `Entity with id ${entityId} not found in session` });
  }

  return res.status(200).json({
    message: `Effect ${effect !== null ? effect : 'cleared'} updated for entities`,
    updatedMonsters,
    updatedNPCs,
    updatedCharacters,
  });
}

export async function enableReactionService(req: IAugmentedRequest, res: Res) {
  // TODO: da true a false
}