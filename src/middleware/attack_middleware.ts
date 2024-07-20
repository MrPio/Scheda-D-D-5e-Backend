import { Request, Response, NextFunction } from 'express';
import { RepositoryFactory } from '../repository/repository_factory';
import { Effect } from '../model/effect';
import { Skill } from '../model/monster_skill';
import { EntityTurn } from '../model/entity_turn';
import { EnchantmentCategory } from '../model/enchantment';
import { Error400Factory } from '../error/error_factory';

const error400Factory: Error400Factory = new Error400Factory();

// Utility function to check if a value is a positive integer
function isPositiveInteger(value: number): boolean {
  const number = Number(value);
  return Number.isInteger(number) && number > 0;
}

/**
 * Checks if the entity can perform the reaction
 */
export const checkEnableReaction = async (req: Request, res: Response, next: NextFunction) => {

  const { sessionId } = req.params;
  const { entityId } = req.body;
  
  const session = await new RepositoryFactory().sessionRepository().getById(sessionId);
  
  let player;
  
  if (session!.characterUIDs?.includes(entityId))
    player = await new RepositoryFactory().characterRepository().getById(sessionId);
  else if (session!.npcUIDs?.includes(entityId))
    player = await new RepositoryFactory().npcRepository().getById(sessionId);
  else if (session!.monsterUIDs?.includes(entityId))
    player = await new RepositoryFactory().monsterRepository().getById(sessionId);  
  else
    return error400Factory.entityNotFoundInSession(entityId).setStatus(res);

  // Check if the reaction is activable for the entity
  if (!player?.isReactionActivable) 
    return error400Factory.reactionNotActivable(entityId).setStatus(res);


  next();
};

/**
 * Checks if these effects can be assigned to the entity
 */
export const checkGiveEffects = async (req: Request, res: Response, next: NextFunction) => {

  const { sessionId } = req.params;
  const { entityId, effect } = req.body;

  const validEffect = Object.values(Effect) as string[];
  const session = await new RepositoryFactory().sessionRepository().getById(sessionId);

  if (!session!.characterUIDs?.includes(entityId) && !session!.npcUIDs?.includes(entityId) && !session!.monsterUIDs?.includes(entityId) )
    return error400Factory.entityNotFoundInSession(entityId).setStatus(res);

  // Check if the element is a valid value based on the enum Effect and the effect list is not null. 
  if (effect) {
    for (const element of effect as string[]) {
      if (!validEffect.includes(element))  
        return error400Factory.invalidEffect(element, validEffect).setStatus(res);

    }
  }

  next();
};

/**
 * Check if the attack can be performed
 */
export const checkTryAttack = async (req: Request, res: Response, next: NextFunction) => {

  const { sessionId } = req.params;
  const { attackerId, attackType, targetId, attackRoll, weapon, enchantment, targetsId, difficultyClass, skill, slotLevel } = req.body;

  const session = await new RepositoryFactory().sessionRepository().getById(sessionId);
  const entityUIDsInTurn = session!.entityTurns.map((turn: EntityTurn) => turn.entityUID);

  if (attackType !== 'attack' && attackType !== 'damageEnchantment' && attackType !== 'savingThrowEnchantment' && attackType !== 'descriptiveEnchantment' )
    return error400Factory.attackTypeInvalid().setStatus(res);

  // Check if the attackerId is valid and save is type.
  let attacker;
  let characterType;

  if (session!.characterUIDs?.includes(attackerId)) {
    attacker = await new RepositoryFactory().characterRepository().getById(attackerId);
    characterType = true;
  } else if (session!.npcUIDs?.includes(attackerId)) {
    attacker = await new RepositoryFactory().npcRepository().getById(attackerId);
    characterType = false;
  } else if (session!.monsterUIDs?.includes(attackerId)) {
    attacker = await new RepositoryFactory().monsterRepository().getById(attackerId);
    characterType = false;
  } else
    return error400Factory.entityNotFoundInSession(attackerId).setStatus(res);

  if (attackType === 'attack') {
    
    // Check if the attack is valid
    if (!isPositiveInteger(attackRoll))
      return error400Factory.invalidInteger('attackRoll').setStatus(res);

    // Check if the target entity is in the battle.
    if (!entityUIDsInTurn.includes(targetId))
      return error400Factory.entityNotFoundInSession(targetId).setStatus(res);

    // Check if the entity possess the weapon
    if (!attacker?.weapons.includes(weapon))
      return error400Factory.weaponNotInInventory(attackerId, weapon).setStatus(res);
  }

  if (attackType === 'damageEnchantment' && attackType === 'savingThrowEnchantment' && attackType === 'descriptiveEnchantment') {

    const enchantmentName = await new RepositoryFactory().enchantmentRepository().getById(enchantment);

    // Check if the enchantment exists
    if (!enchantmentName)
      return error400Factory.enchantmentNotFound(enchantment).setStatus(res);

    // Check if the attacker knows this enchantment
    if (!attacker?.enchantments.includes(enchantment)) 
      return error400Factory.enchantmentNotInInventory(attackerId, enchantment).setStatus(res);

    // Check if it is the turn of the attacker
    if (session!.currentEntityUID !== attackerId && !enchantmentName.isReaction) 
      return error400Factory.notYourTurnEnchantment().setStatus(res);

    // Check if the character has an enchantment level slot to be able to cast it
    if (characterType && enchantmentName.level !== 0) {
  
      const level = enchantmentName.level;
      const player = await new RepositoryFactory().characterRepository().getById(attackerId);

      if (!Number.isInteger(slotLevel) || slotLevel < 1 || slotLevel > 9)
        return error400Factory.invalidSlotLevel().setStatus(res);
      
      if (slotLevel < level)
        return error400Factory.invalidSlotCasting(level, slotLevel).setStatus(res);

      if (player?.slots[slotLevel - 1] === 0)
        return error400Factory.noSlotAvaible(level).setStatus(res);
    }


    if (attackType === 'damageEnchantment') {
      
      // Check if the attack is valid
      if (!isPositiveInteger(attackRoll))
        return error400Factory.invalidInteger('attackRoll').setStatus(res);
  
      // Check if the target entity is in the battle.
      if (!entityUIDsInTurn.includes(targetId))
        return error400Factory.entityNotFoundInSession(targetId).setStatus(res);

      // Check if the category of the enchantment is correct
      if (enchantmentName?.category !== EnchantmentCategory.damage)
        return error400Factory.invalidEnchantmentCategory(enchantment, 'damage').setStatus(res);
  
    }
  
    if (attackType === 'savingThrowEnchantment') {
  
      const validSkill = Object.values(Skill) as string[];
      
      // Check if the category of the enchantment is correct
      if (enchantmentName?.category !== EnchantmentCategory.savingThrow) 
        return error400Factory.invalidEnchantmentCategory(enchantment, 'savingThrow').setStatus(res);
  
      // Check if DC is a positive integer
      if (!isPositiveInteger(difficultyClass))
        return error400Factory.invalidPositiveInteger('difficultyClass').setStatus(res);
    
      // Check if the skill is one of the 6 known
      if (!validSkill.includes(skill))
        return error400Factory.invalidSkill(validSkill).setStatus(res);
    
      // Check if all the entities are in the battle.
      for (const id of targetsId) {
        if (!entityUIDsInTurn.includes(id))
          return error400Factory.entityNotFoundInSession(id).setStatus(res);
      }

    }
  
    if (attackType === 'descriptiveEnchantment') {
  
      // Check if the category of the enchantment is correct
      if (enchantmentName?.category !== EnchantmentCategory.descriptive)
        return error400Factory.invalidEnchantmentCategory(enchantment, 'descriptive').setStatus(res);
      
    }
  
    next();
  }

};

  

/**
 * Check if the saving throw can be thrown
 */
export const checkRequestSavingThrow = async (req: Request, res: Response, next: NextFunction) => {

  const { sessionId } = req.params;
  const { entitiesId, difficultyClass, skill } = req.body;

  const validSkill = Object.values(Skill) as string[];
  const session = await new RepositoryFactory().sessionRepository().getById(sessionId);

  // Check if DC is a positive integer
  if (!isPositiveInteger(difficultyClass))
    return error400Factory.invalidPositiveInteger('difficultyClass').setStatus(res);

  // Check if the skill is one of the 6 known
  if (!validSkill.includes(skill))
    return error400Factory.invalidSkill(validSkill).setStatus(res);

  // Check if all the entities are in the battle.
  const entityUIDsInTurn = session!.entityTurns.map((turn: EntityTurn) => turn.entityUID);
  for (const id of entitiesId) {
    if (!entityUIDsInTurn.includes(id))
      return error400Factory.entityNotFoundInSession(id).setStatus(res);
  }

  next();
};