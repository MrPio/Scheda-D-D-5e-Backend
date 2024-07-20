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

const error400Factory = new Error400Factory();

/**
 * Check if the attack can be performed
 * @precondition `checkSessionExists`
 * @precondition `checkEntityExistsInSession`
 */
export const checkTryAttack = async (req: IAugmentedRequest, res: Response, next: NextFunction) => {
  const body: { attackType: AttackType, attackRoll: number, weapon?: string, enchantment?: string, targetsId: string[], difficultyClass: number, skill: Skill, slotLevel: number } = req.body;
  const entityUIDsInTurn = req.session!.entityTurns.map((turn: EntityTurn) => turn.entityUID);

  // Check that all the target entities are in the session.
  for (const targetId of body.targetsId)
    if (!entityUIDsInTurn.includes(targetId))
      return error400Factory.entityNotFoundInSession(targetId, req.session!.name).setStatus(res);

  if (body.attackType === AttackType.melee) {

    // Check that the attack is valid
    if (body.attackRoll < 1)
      return error400Factory.genericError('attackRoll must be a valid dice roll result!').setStatus(res);

    // Check that the entity possess the weapon
    if (body.weapon && !req.entity!.weapons.includes(body.weapon))
      return error400Factory.inventoryAbscence(req.entityId!, 'weapon', body.weapon).setStatus(res);
  } else {

    // Check that the enchantment exists
    const enchantment = await new RepositoryFactory().enchantmentRepository().getById(body.enchantment!);
    if (!enchantment)
      return error400Factory.enchantmentNotFound(body.enchantment!).setStatus(res);

    // Check that the attacker knows this enchantment
    if (!req.entity?.enchantments.includes(enchantment.name))
      return error400Factory.inventoryAbscence(req.entityId!, 'enchantment', enchantment.name).setStatus(res);

    // Check that it is the turn of the attacker
    if (req.session!.currentEntityUID !== req.entityId && !enchantment.isReaction)
      return error400Factory.genericError('It is not your turn. You cannot cast an enchantment with a casting time other than reaction!').setStatus(res);

    // Check that the character has an enchantment level slot to be able to cast it
    if (req.entityType === EntityType.character && enchantment.level !== 0) {
      if (body.slotLevel < 1 || body.slotLevel > 9)
        return error400Factory.invalidNumber('slotLevel', 'an integer from 1 to 9, inclusive').setStatus(res);

      // Check that the chosen slot level is a valid one for the current enchantment
      if (body.slotLevel < enchantment.level)
        return error400Factory.genericError(`You can't cast a level ${enchantment.level} enchantment with a slot of level ${body.slotLevel}!`).setStatus(res);

      // Check that the character has at least one free slot
      if ((req.entity as Character)?.slots[body.slotLevel - 1] <= 0)
        return error400Factory.genericError(`You don't have a slot of level ${enchantment.level} available!`).setStatus(res);
    }

    // Check if the category of the enchantment is correct
    if (!((enchantment?.category == EnchantmentCategory.damage && body.attackType == AttackType.damageEnchantment) ||
      (enchantment?.category == EnchantmentCategory.descriptive && body.attackType == AttackType.descriptiveEnchantment) ||
      (enchantment?.category == EnchantmentCategory.savingThrow && body.attackType == AttackType.savingThrowEnchantment)))
      return error400Factory.invalidEnchantmentCategory(enchantment.name, enchantment.category).setStatus(res);

    // Check if DC is a non negative integer
    if (body.attackType === AttackType.savingThrowEnchantment && body.difficultyClass >= 0)
      return error400Factory.invalidNumber('difficultyClass', 'a positive integer').setStatus(res);
    next();
  }

};

/**
 * Check if the saving throw can be requested
 * @precondition `checkSessionExists`
 */
export const checkRequestSavingThrow = async (req: IAugmentedRequest, res: Response, next: NextFunction) => {
  const body: { entitiesId: string[], difficultyClass: number, skill: Skill } = req.body;

  // Check if DC is a non negative integer
  if (body.difficultyClass >= 0)
    return error400Factory.invalidNumber('difficultyClass', 'a positive integer').setStatus(res);
  
  // Check if all the entities are in the battle.
  const entityUIDsInTurn = req.session!.entityTurns.map((turn: EntityTurn) => turn.entityUID);
  for (const targetId of body.entitiesId)
    if (!entityUIDsInTurn.includes(targetId))
      return error400Factory.entityNotFoundInSession(targetId, req.session!.name).setStatus(res);
  next();
};

/**
 * Checks if the entity's reaction can be activated.
 * @precondition `checkSessionExists`
 * @precondition `checkEntityExistsInSession`
 */
export const checkEnableReaction = async (req: IAugmentedRequest, res: Response, next: NextFunction) => {
  if (!req.entity!.isReactionActivable)
    return error400Factory.reactionNotActivable(req.entityId!).setStatus(res);
  next();
};
