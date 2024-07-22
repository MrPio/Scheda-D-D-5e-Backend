import { Response } from 'express';
import { Dice } from '../model/dice';
import { randomInt } from 'crypto';
import { Effect } from '../model/effect';
import { Monster } from '../model/monster';
import NPC from '../model/npc';
import Character from '../model/character';
import { findEntity, updateEntity } from './utility/model_queries';
import { Skill } from '../model/monster_skill';
import { IAugmentedRequest } from '../interface/augmented_request';
import IEntity, { EntityType, getEntityId } from '../model/entity';
import { httpPost } from './utility/axios_requests';
import axios from 'axios';
import { AttackType } from '../model/attack_type';
import { ActionType } from '../model/history_message';
import { RepositoryFactory } from '../repository/repository_factory';
import { Error500Factory } from '../error/error_factory';

const error500Factory = new Error500Factory();
const entityTurnRepository = new RepositoryFactory().entityTurnRepository();

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

/**
 * Causes an entity to attack another entity.
 * The attack time can be melee or enchantment and the request body must contain the attempt dice roll.
 * If this is greater than the target's AC, the attacker is asked to roll the damage dice. 
 */
export async function makeAttackService(req: IAugmentedRequest, res: Response) {
  const body: {
    attackType: AttackType,
    attackInfo: {
      targetsId: string[],
      weapon: string,
      attemptRoll?: number,
      enchantment?: string,
      difficultyClass?: number,
      skill?: Skill,
      slotLevel?: number
    }
  } = req.body;

  if (body.attackType === AttackType.melee || body.attackType === AttackType.damageEnchantment) {

    // Determine which targets have been hit.
    const hitTargets: { [id: string]: IEntity } = {};
    for (const targetId of body.attackInfo.targetsId) {
      const entity = (await findEntity(req.session!, targetId))!;
      if (entity.entity.armorClass < body.attackInfo.attemptRoll!)
        hitTargets[targetId] = entity!.entity;
    }

    // Check if at least one entity has been hit and create a new hitory message.
    if (Object.keys(hitTargets).length === 0) {
      httpPost(`/sessions/${req.sessionId!}/broadcast`, { actionType: ActionType.attackAttempt, message: `${req.entity?._name} hasn\'t hit any of their targets!` });
      return res.status(200).json({ message: 'You haven\'t hit any of the entities!' });
    }

    // Ask the attacker to roll the damage dice.
    try {
      const results = (await httpPost(`/sessions/${req.sessionId!}/requestDiceRoll`, { addresseeUIDs: [req.entity!.authorUID!] })) as { data: { [key: string]: { diceRoll: number } } };
      httpPost(`/sessions/${req.sessionId!}/broadcast`, { actionType: ActionType.attackAttempt, message: `${req.entity?._name} has attacked ${Object.values(hitTargets).map(it => it._name).reduce((acc, name) => `${acc}, ${name}`)}!` });
      const diceRoll = results.data[req.entity!.authorUID!].diceRoll;
      for (const target of Object.entries(hitTargets)) {
        target[1]._hp -= diceRoll;
        await updateEntity(req.session!, target[0], { _hp: target[1]._hp });
        if (target[1]._hp <= 0) {
          await entityTurnRepository.delete(req.session?.entityTurns.find(it => it.entityUID === target[0])?.id);
          httpPost(`/sessions/${req.sessionId!}/broadcast`, { actionType: ActionType.died, message: `${target[1]._name} has died!` });
        }
      }
      httpPost(`/sessions/${req.sessionId!}/broadcast`, { actionType: ActionType.attackDamage, message: `${req.entity?._name} has dealt ${diceRoll} damage to ${Object.values(hitTargets).map(it => it._name).reduce((acc, name) => `${acc}, ${name}`)} with ${body.attackInfo.weapon}!` });
      return res.json({ message: `You have dealt ${diceRoll} damage to your enemies!` });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response)
        return res.json(error.response.data);
      return error500Factory.genericError().setStatus(res);
    }
  } else if (body.attackType === AttackType.savingThrowEnchantment) {
    const diceRollReq: { diceList: Dice[], addresseeUIDs: string[], modifiers: number[] } = { diceList: [Dice.d20], addresseeUIDs: [], modifiers: [] };

    // Determine the modifier for each adressee entity.
    const targets: { [id: string]: IEntity } = {};
    for (const entityId of body.attackInfo.targetsId) {
      const entity = await findEntity(req.session!, entityId);
      targets[entityId] = entity!.entity;
      diceRollReq.modifiers.push((entity?.entityType == EntityType.monster ?
        (entity.entity as Monster).getSkillsModifier[body.attackInfo.skill!] :
        (entity?.entity as Character | NPC).skillsModifier[body.attackInfo.skill!]) ?? 0);
      diceRollReq.addresseeUIDs.push(entity!.entity.authorUID);

      // Ask the targets to roll a D20 to determine who will take the damage.
      try {
        const results = (await httpPost(`/sessions/${req.sessionId!}/requestDiceRoll`, diceRollReq)) as { data: { [key: string]: { diceRoll: number } } };
        const hitTargets: { [key: string]: IEntity } = {};
        for (const result of Object.entries(results.data)) {
          const target = Object.values(targets).find(it => it.authorUID == result[0])!;
          if (result[1].diceRoll < body.attackInfo.difficultyClass!)
            hitTargets[result[0]] = target;

          // Create a new HistoryMessage and broadcast it to all the players.
          httpPost(`/sessions/${req.sessionId!}/broadcast`, { actionType: ActionType.savingThrow, message: `${target._name} has ${result[0] in hitTargets ? 'failed' : 'succedeed'} the saving throw!` });
        }

        // Check if at least one entity has been hit and create a new hitory message.
        if (Object.keys(hitTargets).length === 0) {
          httpPost(`/sessions/${req.sessionId!}/broadcast`, { actionType: ActionType.attackAttempt, message: `${req.entity?._name} hasn\'t hit any of their targets!` });
          return res.status(200).json({ message: 'You haven\'t hit any of the entities!' });
        }

        // Ask the attacker to roll the damage dice.
        try {
          const damageResults = (await httpPost(`/sessions/${req.sessionId!}/requestDiceRoll`, { addresseeUIDs: [req.entity!.authorUID!] })) as { data: { [key: string]: { diceRoll: number } } };
          const diceRoll = damageResults.data[req.entity!.authorUID!].diceRoll;
          for (const target of Object.entries(hitTargets)) {
            target[1]._hp -= diceRoll;
            await updateEntity(req.session!, getEntityId(target[1]), { _hp: target[1]._hp });
            if (target[1]._hp <= 0) {
              await entityTurnRepository.delete(req.session?.entityTurns.find(it => it.entityUID === getEntityId(target[1]))?.id);
              httpPost(`/sessions/${req.sessionId!}/broadcast`, { actionType: ActionType.died, message: `${target[1]._name} has died!` });
            }
          }
          httpPost(`/sessions/${req.sessionId!}/broadcast`, { actionType: ActionType.attackDamage, message: `${req.entity?._name} has dealt ${diceRoll} damage to ${Object.values(hitTargets).map(it => it._name).reduce((acc, name) => `${acc}, ${name}`)}!` });
          return res.json({ message: `You have dealt ${diceRoll} damage to your enemies!` });
        } catch (error) {
          if (axios.isAxiosError(error) && error.response)
            return res.json(error.response.data);
          return error500Factory.genericError().setStatus(res);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response)
          return res.json(error.response.data);
        return error500Factory.genericError().setStatus(res);
      }
    }
  } else if (body.attackType === AttackType.descriptiveEnchantment) {
    httpPost(`/sessions/${req.sessionId!}/broadcast`, { actionType: ActionType.descriptiveEnchantment, message: `${req.entity?._name} has cast ${body.attackInfo.enchantment}!` });
    return res.json({ message: `Descriptive enchantment ${body.attackInfo.enchantment} casted successfully!` });
  }
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
  const entityNames: { [id: string]: string } = {};
  for (const entityId of body.entitiesId) {
    const entity = await findEntity(req.session!, entityId);
    entityNames[entity!.entity.authorUID] = entity!.entity._name;
    diceRollReq.modifiers.push((entity?.entityType == EntityType.monster ?
      (entity.entity as Monster).getSkillsModifier[body.skill] :
      (entity?.entity as Character | NPC).skillsModifier[body.skill]) ?? 0);
    diceRollReq.addresseeUIDs.push(entity!.entity.authorUID);
  }

  // Send request to websocket container's API server.
  try {
    const results = (await httpPost(`/sessions/${req.sessionId!}/requestDiceRoll`, diceRollReq)) as { data: { [key: string]: { diceRoll: number } } };
    const response: { [key: string]: boolean } = {};
    for (const result of Object.entries(results.data)) {
      response[result[0]] = result[1].diceRoll >= body.difficultyClass;

      // Create a new HistoryMessage and broadcast it to all the players.
      httpPost(`/sessions/${req.sessionId!}/broadcast`, { actionType: ActionType.savingThrow, message: `${entityNames[result[0]]} has ${response[result[0]] ? 'succedeed' : 'failed'} the saving throw!` });
    }
    return res.json(response);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response)
      return res.json(error.response.data);
    return error500Factory.genericError().setStatus(res);
  }
}

/**
 * Add an effect to multiple entities.
 * If effect is `null`, remove all the effects of the specified entities
 */
export async function addEffectService(req: IAugmentedRequest, res: Response) {
  const body: { entitiesId: string[], effect: Effect | null } = req.body;
  for (const entityId of body.entitiesId) {
    const entity = await findEntity(req.session!, entityId);
    updateEntity(req.session!, entityId, { effects: body.effect ? (entity!.entity.effects ?? []).concat([body.effect]) : [] });
  }
  return res.status(200).json({ message: body.effect ? `Effect ${body.effect} successfully added!` : 'Effects successfully removed!' });
}

/**
 * Enable the reaction ability for a specified entity within a session.
 * It updates the entity's `isReactionActivable` property and saves the changes.
 */
export async function enableReactionService(req: IAugmentedRequest, res: Response) {

  // Send request to websocket container's API server.
  try {
    const results = (await httpPost(`/sessions/${req.sessionId!}/requestReaction`, { addresseeUIDs: req.entities!.map(it => it.authorUID) })) as { data: { [key: string]: { choice: boolean } } };
    const response: { [key: string]: boolean } = {};
    for (const result of Object.entries(results.data)) {
      response[result[0]] = result[1].choice;
      const entity = req.entities!.find(it => it.authorUID == result[0]);
      if (result[1].choice)
        updateEntity(req.session!, getEntityId(entity!), { isReactionActivable: false });

      // Create a new HistoryMessage and broadcast it to all the players.
      httpPost(`/sessions/${req.sessionId!}/broadcast`, { actionType: ActionType.reaction, message: `${entity?._name} has ${response[result[0]] ? 'accepted' : 'refused'} to use the reaction!` });
    }
    return res.json(response);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response)
      return res.json(error.response.data);
    return error500Factory.genericError().setStatus(res);
  }
}