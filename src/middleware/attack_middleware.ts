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

// Check if the attack can be performed
export const tryAttack = async (req: Request, res: Response, next: NextFunction) => {

  const { sessionId, attackType, attackerId } = req.query;
  const sessionID = String(sessionId);
  const AttackType = String(attackType);
  const attackerID = String(attackerId);

  const session = await new RepositoryFactory().sessionRepository().getById(sessionID);
            
  // Check if the session exist & the attackType is valid
  if (!session) {
    return res.status(400).json({ error: `the session ${sessionID} is not found` });
  }

  const entityUIDsInTurn = session.entityTurns.map((turn: EntityTurn) => turn.entityUID);

  if (AttackType !== 'attack' && AttackType !== 'damageEnchantment' && AttackType !== 'savingThrowEnchantment' && AttackType !== 'descriptiveEnchantment' ) {
    return res.status(400).json({ error: 'the attackType is invalid. The attackType must be one of the following values: Attack, damageEnchantment, savingThrowEnchantment, descriptiveEnchantment' });
  }

  // Check if the attackerId is valid and save is type.
  let attacker;
  let attackerType;
  if (session.characterUIDs?.includes(attackerID)) {
    attacker = await new RepositoryFactory().characterRepository().getById(attackerID);
    attackerType = 'player';
  } else if (session.npcUIDs?.includes(attackerID)) {
    attacker = await new RepositoryFactory().npcRepository().getById(attackerID);
    attackerType = 'non_player';
  } else if (session.monsterUIDs?.includes(attackerID)) {
    attacker = await new RepositoryFactory().monsterRepository().getById(attackerID);
    attackerType = 'non_player';
  } else {
    return res.status(400).json({ error: `the entity: ${attackerId} is not in the battle` });
  }

  if (AttackType === 'attack') {

    const { targetId, attackRoll, weapon } = req.query;

    const targetID = String(targetId);
    const AttackRoll = Number(attackRoll);
    const Weapon = String(weapon);

    // Check if the attack is valid
    if (!isPositiveInteger(AttackRoll))
      return res.status(400).json({ error: 'the attack must be an integer' });

    // Check if the target entity is in the battle.
    if (!entityUIDsInTurn.includes(targetID))
      return res.status(400).json({ error: `the entity ${targetID} is not in the battle` });

    // Check if the entity possess the weapon
    if (!attacker?.weapons.includes(Weapon))
      return res.status(400).json({ error: `the entity does not possess the weapon ${Weapon}` });
  }

  if (AttackType === 'damageEnchantment') {

    const { enchantment, targetId, attackRoll } = req.query;
    const Enchantment = String(enchantment);
    const targetID = String(targetId);
    const AttackRoll = Number(attackRoll);

    const allEnchantment = await new RepositoryFactory().enchantmentRepository().getById(Enchantment);
    
    // Check if the attack is valid
    if (!isPositiveInteger(AttackRoll))
      return res.status(400).json({ error: 'the attack must be an integer' });

    // Check if the target entity is in the battle.
    if (!entityUIDsInTurn.includes(targetID))
      return res.status(400).json({ error: `the entity ${targetID} is not in the battle` });

    // Check if the enchantment exists
    if (!allEnchantment)
      return res.status(400).json({ error: `the spell: ${enchantment} is not found` });

    // Check if the category of the enchantment is correct
    if (allEnchantment?.category !== EnchantmentCategory.damage)
      return res.status(400).json({ error: `the spell: ${enchantment} belongs to the category of spells: ${allEnchantment?.category}` });

    // Check if the attacker knows this enchantment
    if (!attacker?.enchantments.includes(Enchantment)) 
      return res.status(400).json({ error: `the entity: ${attackerId} does not know the spell: ${enchantment}` });

    // Check if it is the turn of the attacker
    if (session.currentEntityUID !== attackerID && !allEnchantment.isReaction) 
      return res.status(400).json({ error: `it is not the turn of ${attackerID}, therefore he cannot cast an enchantment with a casting time other than reaction.` });
    
    // Check if the character has an enchantment level slot to be able to cast it
    if (attackerType === 'player' && allEnchantment.level !== 0) {

      const { slotLevel } = req.query;
      const slot = Number(slotLevel);
      const level = allEnchantment.level;
      const player = await new RepositoryFactory().characterRepository().getById(attackerID);

      if (!Number.isInteger(slot) || slot < 1 || slot > 9)
        return res.status(400).json({ error: 'the slot must be an integer from 1 to 9, inclusive' });
      
      if (slot < level)
        return res.status(400).json({ error: `you can't cast a level ${level} enchantment with a level ${slot} slot` });

      if (player?.slots[slot - 1] === 0)
        return res.status(400).json({ error: `you don't have a level ${slot} slot available` });
    }

  }

  if (AttackType === 'savingThrowEnchantment') {
    
    const { enchantment, targetsId, difficultyClass, skill } = req.query;
    const Enchantment = String(enchantment);
    const validSkill = Object.values(Skill) as string[];
    const sKill = String(skill);
    const DC = Number(difficultyClass);

    const allEnchantment = await new RepositoryFactory().enchantmentRepository().getById(Enchantment);

    // Check if the enchantment exists
    if (!allEnchantment) 
      return res.status(400).json({ error: `the spell: ${enchantment} is not found` });
    
    // Check if the category of the enchantment is correct
    if (allEnchantment?.category !== EnchantmentCategory.savingThrow) 
      return res.status(400).json({ error: `the spell: ${enchantment} belongs to the category of spells: ${allEnchantment?.category}` });
    
    // Check if the attacker knows this enchantment
    if (!attacker?.enchantments.includes(Enchantment))
      return res.status(400).json({ error: `the entity: ${attackerId} does not know the enchantment: ${enchantment}` });

    // Check if it is the turn of the attacker
    if (session.currentEntityUID !== attackerID && !allEnchantment.isReaction) 
      return res.status(400).json({ error: `it is not the turn of ${attackerID}, therefore he cannot cast an enchantment with a casting time other than reaction.` });

    // Check if DC is a positive integer
    if (!isPositiveInteger(DC))
      return res.status(400).json({ error: `the number: ${sessionID} is not a positive integer` });
  
    // Check if the skill is one of the 6 known
    if (!validSkill.includes(sKill))
      return res.status(400).json({ error: `Invalid skill. The skill must be one of the following values: ${validSkill.join(', ')}.` });
  
    // Check if entitiesId is defined and is an array of strings (optional to remove an error)
    if (!targetsId || !Array.isArray(targetsId) || targetsId.length === 0 || !targetsId.every(item => typeof item === 'string'))
      return res.status(400).json({ error: 'entitiesId must be a non-empty list of strings.' });
  
    // Check if all the entities are in the battle.
    for (const id of targetsId) {
      if (!entityUIDsInTurn.includes(id))
        return res.status(400).json({ error: `the entity ${id} is not in the battle` });
    }

    // Check if the character has an enchantment level slot to be able to cast it
    if (attackerType === 'player' && allEnchantment.level !== 0) {

      const { slotLevel } = req.query;
      const slot = Number(slotLevel);
      const level = allEnchantment.level;
      const player = await new RepositoryFactory().characterRepository().getById(attackerID);

      if (!Number.isInteger(slot) || slot < 1 || slot > 9)
        return res.status(400).json({ error: 'the slot must be an integer from 1 to 9, inclusive' });
      
      if (slot < level)
        return res.status(400).json({ error: `you can't cast a level ${level} enchantment with a level ${slot} slot` });

      if (player?.slots[slot - 1] === 0)
        return res.status(400).json({ error: `you don't have a level ${slot} slot available` });
    }
  }

  if (AttackType === 'descriptiveEnchantment') {

    const { enchantment } = req.query;
    const Enchantment = String(enchantment);

    const allEnchantment = await new RepositoryFactory().enchantmentRepository().getById(Enchantment);

    // Check if the enchantment exists
    if (!allEnchantment)
      return res.status(400).json({ error: `the spell: ${enchantment} is not found` });

    // Check if the category of the enchantment is correct
    if (allEnchantment?.category !== EnchantmentCategory.descriptive)
      return res.status(400).json({ error: `the spell: ${enchantment} belongs to the category of spells: ${allEnchantment?.category}` });

    // Check if the attacker knows this enchantment
    if (!attacker?.enchantments.includes(Enchantment)) 
      return res.status(400).json({ error: `the entity: ${attackerId} does not know the spell: ${enchantment}` });

    // Check if it is the turn of the attacker
    if (session.currentEntityUID !== attackerID && !allEnchantment.isReaction) 
      return res.status(400).json({ error: `it is not the turn of ${attackerID}, therefore he cannot cast an enchantment with a casting time other than reaction.` });
    
    // Check if the character has an enchantment level slot to be able to cast it
    if (attackerType === 'player' && allEnchantment.level !== 0) {

      const { slotLevel } = req.query;
      const slot = Number(slotLevel);
      const level = allEnchantment.level;
      const player = await new RepositoryFactory().characterRepository().getById(attackerID);

      if (!Number.isInteger(slot) || slot < 1 || slot > 9)
        return res.status(400).json({ error: 'the slot must be an integer from 1 to 9, inclusive' });
      
      if (slot < level)
        return res.status(400).json({ error: `you can't cast a level ${level} enchantment with a level ${slot} slot` });

      if (player?.slots[slot - 1] === 0)
        return res.status(400).json({ error: `you don't have a level ${slot} slot available` });
    }
  }

  next();
};

// Check if the saving throw can be thrown
export const requestSavingThrow = async (req: Request, res: Response, next: NextFunction) => {

  const { sessionId, entitiesId, difficultyClass, skill } = req.query;

  const validSkill = Object.values(Skill) as string[];
  const sKill = String(skill);
  const sessionID = String(sessionId);
  const DC = Number(difficultyClass);

  const session = await new RepositoryFactory().sessionRepository().getById(sessionID);
            
  // Check if the session exist
  if (!session) {
    return res.status(400).json({ error: `the session ${sessionID} is not found` });
  }

  // Check if DC is a positive integer
  if (!isPositiveInteger(DC)) {
    return res.status(400).json({ error: `the number: ${sessionID} is not a positive integer` });
  }

  // Check if the skill is one of the 6 known
  if (!validSkill.includes(sKill)) {
    return res.status(400).json({ error: `Invalid skill. The skill must be one of the following values: ${validSkill.join(', ')}.` });
  }

  // Check if entitiesId is defined and is an array of strings (optional to remove an error)
  if (!entitiesId || !Array.isArray(entitiesId) || entitiesId.length === 0 || !entitiesId.every(item => typeof item === 'string')) {
    return res.status(400).json({ error: 'entitiesId must be a non-empty list of strings.' });
  }

  // Check if all the entities are in the battle.
  const entityUIDsInTurn = session.entityTurns.map((turn: EntityTurn) => turn.entityUID);
  for (const id of entitiesId) {
    if (!entityUIDsInTurn.includes(id)) {
      return res.status(400).json({ error: `the entity ${id} is not in the battle` });
    }
  }

  next();
};