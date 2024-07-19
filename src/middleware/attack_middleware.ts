import { Request, Response, NextFunction } from 'express';
import { RepositoryFactory } from '../repository/repository_factory';
import { Effect } from '../model/effect';
import { Skill } from '../model/monster_skill';
import { EntityTurn } from '../model/entity_turn';
import { EnchantmentCategory } from '../model/enchantment';

//import { EntityTurn } from '../model/entity_turn';

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
  
  if (session!.characterUIDs?.includes(entityId)) {
    player = await new RepositoryFactory().characterRepository().getById(sessionId);
  } else if (session!.npcUIDs?.includes(entityId)) {
    player = await new RepositoryFactory().npcRepository().getById(sessionId);
  } else if (session!.monsterUIDs?.includes(entityId)) {
    player = await new RepositoryFactory().monsterRepository().getById(sessionId);  
  } else {
    return res.status(400).json({ error: `Entity ${entityId} not found!` }); 
  }

  // Check if the reaction is activable for the entity
  if (!player?.isReactionActivable) {
    return res.status(400).json({ error: `Entity ${entityId} has already used its reaction!` }); 
  }

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

  if (!session!.characterUIDs?.includes(entityId) && !session!.npcUIDs?.includes(entityId) && !session!.monsterUIDs?.includes(entityId) ) {
    return res.status(400).json({ error: `Entity ${entityId} not found in${sessionId}!` }); 
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

/**
 * Check if the attack can be performed
 */
export const checkTryAttack = async (req: Request, res: Response, next: NextFunction) => {

  const { sessionId } = req.params;
  const { attackerId, attackType, targetId, attackRoll, weapon, enchantment, targetsId, difficultyClass, skill, slotLevel } = req.body;

  const session = await new RepositoryFactory().sessionRepository().getById(sessionId);
  const entityUIDsInTurn = session!.entityTurns.map((turn: EntityTurn) => turn.entityUID);

  if (attackType !== 'attack' && attackType !== 'damageEnchantment' && attackType !== 'savingThrowEnchantment' && attackType !== 'descriptiveEnchantment' ) {
    return res.status(400).json({ error: 'Invalid attackType. It must be one of the following values: Attack, damageEnchantment, savingThrowEnchantment, descriptiveEnchantment!' });
  }

  // Check if the attackerId is valid and save is type.
  let attacker;
  let attackerType;
  if (session!.characterUIDs?.includes(attackerId)) {
    attacker = await new RepositoryFactory().characterRepository().getById(attackerId);
    attackerType = 'player';
  } else if (session!.npcUIDs?.includes(attackerId)) {
    attacker = await new RepositoryFactory().npcRepository().getById(attackerId);
    attackerType = 'non_player';
  } else if (session!.monsterUIDs?.includes(attackerId)) {
    attacker = await new RepositoryFactory().monsterRepository().getById(attackerId);
    attackerType = 'non_player';
  } else {
    return res.status(400).json({ error: `Entity: ${attackerId} is not in the battle!` });
  }

  if (attackType === 'attack') {
    // Check if the attack is valid
    if (!isPositiveInteger(attackRoll))
      return res.status(400).json({ error: 'Attack value must be an integer number!' });

    // Check if the target entity is in the battle.
    if (!entityUIDsInTurn.includes(targetId))
      return res.status(400).json({ error: `Entity ${targetId} is not in the battle!` });

    // Check if the entity possess the weapon
    if (!attacker?.weapons.includes(weapon))
      return res.status(400).json({ error: `Entity ${attackerId} does not possess the weapon ${weapon}!` });
  }

  if (attackType === 'damageEnchantment') {

    const allEnchantment = await new RepositoryFactory().enchantmentRepository().getById(enchantment);
    
    // Check if the attack is valid
    if (!isPositiveInteger(attackRoll))
      return res.status(400).json({ error: 'Attack value must be an integer number!' });

    // Check if the target entity is in the battle.
    if (!entityUIDsInTurn.includes(targetId))
      return res.status(400).json({ error: `Entity ${targetId} is not in the battle!` });

    // Check if the enchantment exists
    if (!allEnchantment)
      return res.status(400).json({ error: `Spell ${enchantment} not found!` });

    // Check if the category of the enchantment is correct
    if (allEnchantment?.category !== EnchantmentCategory.damage)
      return res.status(400).json({ error: `Spell: ${enchantment} does not belong to category of spells ${allEnchantment?.category}!` });

    // Check if the attacker knows this enchantment
    if (!attacker?.enchantments.includes(enchantment)) 
      return res.status(400).json({ error: `Entity ${attackerId} does not know the spell ${enchantment}!` });

    // Check if it is the turn of the attacker
    if (session!.currentEntityUID !== attackerId && !allEnchantment.isReaction) 
      return res.status(400).json({ error: `It's not the turn of ${attackerId}: he cannot cast an enchantment with a casting time other than reaction!` });
    
    // Check if the character has an enchantment level slot to be able to cast it
    if (attackerType === 'player' && allEnchantment.level !== 0) {

      const level = allEnchantment.level;
      const player = await new RepositoryFactory().characterRepository().getById(attackerId);

      if (!Number.isInteger(slotLevel) || slotLevel < 1 || slotLevel > 9)
        return res.status(400).json({ error: 'Slot must be an integer from 1 to 9, inclusive!' });
      
      if (slotLevel < level)
        return res.status(400).json({ error: `You can't cast a level ${level} enchantment with a level ${slotLevel} slot!` });

      if (player?.slots[slotLevel - 1] === 0)
        return res.status(400).json({ error: `You don't have a level ${slotLevel} slot available!` });
    }

  }

  if (attackType === 'savingThrowEnchantment') {

    const allEnchantment = await new RepositoryFactory().enchantmentRepository().getById(enchantment);
    const validSkill = Object.values(Skill) as string[];

    // Check if the enchantment exists
    if (!allEnchantment) 
      return res.status(400).json({ error: `Spell ${enchantment} not found` });
    
    // Check if the category of the enchantment is correct
    if (allEnchantment?.category !== EnchantmentCategory.savingThrow) 
      return res.status(400).json({ error: `Spell ${enchantment} belongs to the category of spells ${allEnchantment?.category}!` });
    
    // Check if the attacker knows this enchantment
    if (!attacker?.enchantments.includes(enchantment))
      return res.status(400).json({ error: `Entity ${attackerId} does not know the enchantment ${enchantment}!` });

    // Check if it is the turn of the attacker
    if (session!.currentEntityUID !== attackerId && !allEnchantment.isReaction) 
      return res.status(400).json({ error: `It's not the turn of ${attackerId}: he cannot cast an enchantment with a casting time other than reaction!` });

    // Check if DC is a positive integer
    if (!isPositiveInteger(difficultyClass))
      return res.status(400).json({ error: `Number ${difficultyClass} is not a positive integer!` });
  
    // Check if the skill is one of the 6 known
    if (!validSkill.includes(skill))
      return res.status(400).json({ error: `Invalid skill. It must be one of the following values: ${validSkill.join(', ')}!` });
  
    // Check if entitiesId is defined and is an array of strings (optional to remove an error)
    if (!targetsId || !Array.isArray(targetsId) || targetsId.length === 0 || !targetsId.every(item => typeof item === 'string'))
      return res.status(400).json({ error: '"entitiesId" must be a non-empty list of strings!' });
  
    // Check if all the entities are in the battle.
    for (const id of targetsId) {
      if (!entityUIDsInTurn.includes(id))
        return res.status(400).json({ error: `Entity ${id} is not in the battle!` });
    }

    // Check if the character has an enchantment level slot to be able to cast it
    if (attackerType === 'player' && allEnchantment.level !== 0) {

      const level = allEnchantment.level;
      const player = await new RepositoryFactory().characterRepository().getById(attackerId);

      if (!Number.isInteger(slotLevel) || slotLevel < 1 || slotLevel > 9)
        return res.status(400).json({ error: 'Slot must be an integer from 1 to 9!' });
      
      if (slotLevel < level)
        return res.status(400).json({ error: `You can't cast a level ${level} enchantment with a level ${slotLevel} slot!` });

      if (player?.slots[slotLevel - 1] === 0)
        return res.status(400).json({ error: `You don't have a level ${slotLevel} slot available!` });
    }
  }

  if (attackType === 'descriptiveEnchantment') {


    const allEnchantment = await new RepositoryFactory().enchantmentRepository().getById(enchantment);

    // Check if the enchantment exists
    if (!allEnchantment)
      return res.status(400).json({ error: `Spell ${enchantment} not found!` });

    // Check if the category of the enchantment is correct
    if (allEnchantment?.category !== EnchantmentCategory.descriptive)
      return res.status(400).json({ error: `Spell ${enchantment} belongs to the category of spells: ${allEnchantment?.category}!` });

    // Check if the attacker knows this enchantment
    if (!attacker?.enchantments.includes(enchantment)) 
      return res.status(400).json({ error: `Entity: ${attackerId} does not know the spell: ${enchantment}!` });

    // Check if it is the turn of the attacker
    if (session!.currentEntityUID !== attackerId && !allEnchantment.isReaction) 
      return res.status(400).json({ error: `It's not the turn of ${attackerId}: he cannot cast an enchantment with a casting time other than reaction.` });
    
    // Check if the character has an enchantment level slot to be able to cast it
    if (attackerType === 'player' && allEnchantment.level !== 0) {

      const level = allEnchantment.level;
      const player = await new RepositoryFactory().characterRepository().getById(attackerId);

      if (!Number.isInteger(slotLevel) || slotLevel < 1 || slotLevel > 9)
        return res.status(400).json({ error: 'Slot must be an integer from 1 to 9!' });
      
      if (slotLevel < level)
        return res.status(400).json({ error: `You can't cast a level ${level} enchantment with a level ${slotLevel} slot!` });

      if (player?.slots[slotLevel - 1] === 0)
        return res.status(400).json({ error: `You don't have a level ${slotLevel} slot available!` });
    }
  }

  next();
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
  if (!isPositiveInteger(difficultyClass)) {
    return res.status(400).json({ error: `Number ${sessionId} is not a positive integer!` });
  }

  // Check if the skill is one of the 6 known
  if (!validSkill.includes(skill)) {
    return res.status(400).json({ error: `Invalid skill. It must be one of the following values: ${validSkill.join(', ')}!` });
  }

  // Check if entitiesId is defined and is an array of strings (optional to remove an error)
  if (!entitiesId || !Array.isArray(entitiesId) || entitiesId.length === 0 || !entitiesId.every(item => typeof item === 'string')) {
    return res.status(400).json({ error: 'entitiesId must be a non-empty list of strings!' });
  }

  // Check if all the entities are in the battle.
  const entityUIDsInTurn = session!.entityTurns.map((turn: EntityTurn) => turn.entityUID);
  for (const id of entitiesId) {
    if (!entityUIDsInTurn.includes(id)) {
      return res.status(400).json({ error: `Entity ${id} is not in the battle!` });
    }
  }

  next();
};