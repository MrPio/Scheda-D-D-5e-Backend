import { Response, NextFunction } from 'express';
import { RepositoryFactory } from '../repository/repository_factory';
import { Skill } from '../model/monster_skill';
import { EntityTurn } from '../model/entity_turn';
import { EnchantmentCategory } from '../model/enchantment';
import { Error400Factory } from '../error/error_factory';
import { IAugmentedRequest } from '../interface/augmented_request';
import { AttackType } from '../model/attack_type';
import Character from '../model/character';
import { EntityType } from '../model/entity';
import { Effect } from '../model/effect';
import { findEntity } from '../service/utility/model_queries';
import { Monster } from '../model/monster';

const error400Factory = new Error400Factory();

/**
 * Check if the attack can be performed.
 * @precondition `checkSessionExists`
 * @precondition `checkEntityExistsInSession`
 */
export const checkAttackAttempt = async (req: IAugmentedRequest, res: Response, next: NextFunction) => {
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
  const entityUIDsInTurn = req.session!.entityTurns.map((turn: EntityTurn) => turn.entityUID);

  // Check that there is at leat one target.
  if (body.attackType !== AttackType.descriptiveEnchantment)
    if (!body.attackInfo.targetsId || body.attackInfo.targetsId.length === 0)
      return error400Factory.genericError('You must specify at least one target!').setStatus(res);
    else if (body.attackInfo.targetsId.includes(req.entityId!))
      return error400Factory.genericError('You cannot attack yourself!').setStatus(res);

  // Check that all the target entities are in the session.
  for (const targetId of body.attackInfo.targetsId)
    if (!entityUIDsInTurn.includes(targetId))
      return error400Factory.entityNotFoundInSession(targetId, req.session!.name).setStatus(res);

  if (body.attackType === AttackType.melee) {

    // Check that the attack is valid
    if (body.attackInfo.attemptRoll! < 1)
      return error400Factory.genericError('attackRoll must be a valid dice roll result!').setStatus(res);

    // Check that the entity possess the weapon
    if (body.attackInfo.weapon && !req.entity!.weapons.includes(body.attackInfo.weapon))
      return error400Factory.inventoryAbscence(req.entityId!, 'weapon', body.attackInfo.weapon).setStatus(res);
  } else {

    // Check that the enchantment exists
    const enchantment = await new RepositoryFactory().enchantmentRepository().getById(body.attackInfo.enchantment!);
    if (!enchantment)
      return error400Factory.enchantmentNotFound(body.attackInfo.enchantment!).setStatus(res);

    // Check that the attacker knows this enchantment
    if (!req.entity?.enchantments.includes(enchantment.name))
      return error400Factory.inventoryAbscence(req.entityId!, 'enchantment', enchantment.name).setStatus(res);

    // Check that it is the turn of the attacker
    if (req.session!.currentEntityUID !== req.entityId && !enchantment.isReaction)
      return error400Factory.genericError('It is not your turn. You cannot cast an enchantment with a casting time other than reaction!').setStatus(res);

    // Check that the character has an enchantment level slot to be able to cast it
    if (req.entityType === EntityType.character && enchantment.level !== 0) {
      if (body.attackInfo.slotLevel! < 1 || body.attackInfo.slotLevel! > 9)
        return error400Factory.invalidNumber('slotLevel', 'an integer from 1 to 9, inclusive').setStatus(res);

      // Check that the chosen slot level is a valid one for the current enchantment
      if (body.attackInfo.slotLevel! >= enchantment.level)
        return error400Factory.genericError(`You can't cast a level ${enchantment.level} enchantment with a slot of level ${body.attackInfo.slotLevel!}!`).setStatus(res);

      // Check that the character has at least one free slot
      if ((req.entity as Character)?.slots[body.attackInfo.slotLevel! - 1] <= 0)
        return error400Factory.genericError(`You don't have a slot of level ${enchantment.level} available!`).setStatus(res);
    }

    // Check if the category of the enchantment is correct
    if (!((enchantment?.category == EnchantmentCategory.damage && body.attackType == AttackType.damageEnchantment) ||
      (enchantment?.category == EnchantmentCategory.descriptive && body.attackType == AttackType.descriptiveEnchantment) ||
      (enchantment?.category == EnchantmentCategory.savingThrow && body.attackType == AttackType.savingThrowEnchantment)))
      return error400Factory.invalidEnchantmentCategory(enchantment.name, body.attackType).setStatus(res);

    // Check if DC is a non negative integer
    if (body.attackType === AttackType.savingThrowEnchantment && body.attackInfo.difficultyClass! < 0)
      return error400Factory.invalidNumber('difficultyClass', 'a positive integer').setStatus(res);
  }

  next();
};

/**
 * Check if the saving throw can be requested
 * @precondition `checkSessionExists`
 */
export const checkRequestSavingThrow = async (req: IAugmentedRequest, res: Response, next: NextFunction) => {
  const body: { entitiesId: string[], difficultyClass: number, skill: Skill } = req.body;

  // Check if DC is a non negative integer
  if (body.difficultyClass <= 0)
    return error400Factory.invalidNumber('difficultyClass', 'a positive integer').setStatus(res);

  // Check if all the entities are in the battle.
  const entityUIDsInTurn = req.session!.entityTurns.map((turn: EntityTurn) => turn.entityUID);
  for (const targetId of body.entitiesId)
    if (!entityUIDsInTurn.includes(targetId))
      return error400Factory.entityNotFoundInSession(targetId, req.session!.name).setStatus(res);
  next();
};

// Check if the effect can be assigned to an entity
export const checkAddEffect = async (req: IAugmentedRequest, res: Response, next: NextFunction) => {
  const body: { entitiesId: string[], effect?: Effect } = req.body;
  for (const entityId of body.entitiesId) {
    const entity = await findEntity(req.session!, entityId);
    console.log((entity!.entity as Monster).effectImmunities, body.effect);
    if (body.effect && entity!.entityType === EntityType.monster && (entity!.entity as Monster).effectImmunities!.includes(body.effect))
      return error400Factory.genericError(`Monster ${entity?.entity._name} is immune to effect ${body.effect}!`).setStatus(res);
  }
  next();
};

/**
 * Checks if the entity's reaction can be activated.
 * @precondition `checkSessionExists`
 * @precondition `checkEntitiesExistsInSession`
 */
export const checkEnableReaction = async (req: IAugmentedRequest, res: Response, next: NextFunction) => {
  for (const entity of req.entities!)
    if (!entity.isReactionActivable)
      return error400Factory.reactionNotActivable(entity._name).setStatus(res);
  next();
};
