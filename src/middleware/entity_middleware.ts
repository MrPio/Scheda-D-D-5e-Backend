import { Request, Response, NextFunction } from 'express';
import { Effect } from '../model/effect';
import { RepositoryFactory } from '../repository/repository_factory';
import { Error400Factory } from '../error/error_factory';
import { EntityTurn } from '../model/entity_turn';

const error400Factory: Error400Factory = new Error400Factory();

/**
 * Utility function to check if a value is a positive integer
 */
function isPositiveInteger(value: number): boolean {
  const number = Number(value);
  return Number.isInteger(number) && number > 0;
}

/**
 * Utility function to check if a value is an integer
 */
function isInteger(value: number): boolean {
  const number = Number(value);
  return Number.isInteger(number);
}

/**
 * Utility function to check if a value is positive and divisible by 1.5
 */
function isValidSpeed(value: number): boolean {
  const number = Number(value);
  return number > 0 && number % 1.5 === 0;
}

/**
 * Utility function to check if a value is an integer between 1 and 30
 */
function isValidAttributeValue(value: number): boolean {
  const number = Number(value);
  return Number.isInteger(number) && number >= 1 && number <= 30;
}

/**
 * Check the validity of adding a new entity to a session
 */
export const checkAddEntity = async (req: Request, res: Response, next: NextFunction) => {
  
  const { sessionId } = req.params;
  const { entityType } = req.body;
  const session = await new RepositoryFactory().sessionRepository().getById(sessionId);
    
  // Check if the entityType is correct
  if (entityType !== 'npc' && entityType !== 'monster' && entityType !== 'character')
    return error400Factory.wrongParameterType('entityType', 'character, npc, monster').setStatus(res);

  // Check if the entity is a Monster
  if (entityType === 'monster') {
    const { maxHp, armorClass, enchantments, weapons, effectImmunities, speed, strength, dexterity, intelligence, wisdom, charisma, constitution } = req.body;

    // Convert enum values to an array of strings
    const validEffect = Object.values(Effect) as string[];

    // Check maxHp
    if (!isPositiveInteger(maxHp))
      return error400Factory.invalidNumber('maxHp', 'a positive integer').setStatus(res);

    // Check armorClass
    if (!isPositiveInteger(armorClass))
      return error400Factory.invalidNumber('armorClass', 'a positive integer' ).setStatus(res);

    // Check speed
    if (!isValidSpeed(speed))
      return error400Factory.invalidNumber('speed', 'a positive number divisible by 1.5').setStatus(res);
    
    // Check skillValues
    if (!isValidAttributeValue(strength))
      return error400Factory.invalidNumber('strength', 'an integer between 1 and 30').setStatus(res);

    if (!isValidAttributeValue(dexterity))
      return error400Factory.invalidNumber('dexterity', 'an integer between 1 and 30').setStatus(res);
    
    if (!isValidAttributeValue(intelligence))
      return error400Factory.invalidNumber('intelligence', 'an integer between 1 and 30').setStatus(res);
    
    if (!isValidAttributeValue(wisdom))
      return error400Factory.invalidNumber('wisdom', 'an integer between 1 and 30').setStatus(res);
    
    if (!isValidAttributeValue(charisma))
      return error400Factory.invalidNumber('charisma', 'an integer between 1 and 30').setStatus(res);
    
    if (!isValidAttributeValue(constitution))
      return error400Factory.invalidNumber('constitution', 'an integer between 1 and 30').setStatus(res);
    

    // Check effectImmunities
    if (!effectImmunities) {
      if (!Array.isArray(effectImmunities))
        return error400Factory.wrongParameterType('effectImmunities', 'list').setStatus(res);
  
      for (const element of effectImmunities as string[]) {
        if (!validEffect.includes(element))
          return error400Factory.wrongElementTypeError('effect immunities', element, validEffect).setStatus(res);
      }
    }
    

    // Check enchantments
    if (enchantments) {

      if (!Array.isArray(enchantments))
        return error400Factory.wrongParameterType('enchantments', 'list').setStatus(res);

      const enchantmentRepository = new RepositoryFactory().enchantmentRepository();
    
      // Verify the name of the enchantments
      for (const enchantmentId of enchantments) {
        const enchantment = await enchantmentRepository.getById(enchantmentId);
        if (!enchantment)
          return error400Factory.enchantmentNotFound(enchantmentId).setStatus(res);
      }
      
    }

    // Check weapons
    if (weapons) {
      if (!Array.isArray(weapons))
        return error400Factory.wrongParameterType('weapons', 'list').setStatus(res);

    }
  }

  // Check if the entity is a Character
  if (entityType === 'character') {

    const { uid } = req.body;

    const character = await new RepositoryFactory().characterRepository().getById(uid);
    
    if (!character) 
      return error400Factory.characterNotFound(uid).setStatus(res);

    if (session!.characterUIDs?.includes(uid))
      return error400Factory.entityIsOnBattle(`The "${uid}" is already in the battle!`).setStatus(res);
    
  }

  // Check if the entity is a Npc
  if (entityType === 'npc') {

    const { uid } = req.body;

    const npc = await new RepositoryFactory().npcRepository().getById(uid);
    
    if (!npc) 
      return error400Factory.npcNotFound(uid).setStatus(res);

    if (session!.characterUIDs?.includes(uid))
      return error400Factory.entityIsOnBattle(`The "${uid}" is already in the battle!`).setStatus(res);
  }
   
  next();
};

/**
 * Checks if the entity is in the session
 */
export const checkEntityInSession = async (req: Request, res: Response, next: NextFunction) => {
  const { entityId, sessionId } = req.params;

  const session = await new RepositoryFactory().sessionRepository().getById(sessionId);

  const entityUIDsInTurn = session!.entityTurns.map((turn: EntityTurn) => turn.entityUID);

  // Check if the entityId exists in the battle
  if (!entityUIDsInTurn.includes(entityId))
    return error400Factory.entityNotFoundInSession(entityId, sessionId).setStatus(res);

  next();
};



/**
 * Checks if an entity update is valid
 */
//TODO: MrPio check turn
export const checkUpdateEntity = async (req: Request, res: Response, next: NextFunction) => {

  const { entityId, sessionId } = req.params;

  const session = await new RepositoryFactory().sessionRepository().getById(sessionId);

  // Check if the entityId is in the session
  if (!session!.characterUIDs?.includes(entityId) && !session!.npcUIDs?.includes(entityId) && !session!.monsterUIDs?.includes(entityId)) 
    return error400Factory.entityNotFoundInSession(entityId, sessionId).setStatus(res);

  // Convert enum values to an array of strings
  const validEffect = Object.values(Effect) as string[];
  const { hp, armorClass, speed, effects, slots } = req.body;

  // Check effects
  if (!Array.isArray(effects))
    return error400Factory.wrongParameterType('effect', 'list').setStatus(res);

  // Check for any modification
  if (hp && !armorClass && !speed && !effects)
    return error400Factory.noModification('You need to change at least one parameter.!').setStatus(res);

  // Check if the element is a valid value based on the enum Effect. 
  if (effects) {

    if (!Array.isArray(effects))
      return error400Factory.wrongParameterType('effects', 'list').setStatus(res);

    for (const element of validEffect as string[]) {
      if (!validEffect.includes(element))
        return error400Factory.wrongElementTypeError('effect', element, validEffect).setStatus(res);
    }

  }
  
  // Check speed
  if (!isValidSpeed(speed))
    return error400Factory.invalidNumber('speed', 'a positive number divisible by 1.5').setStatus(res);

  // Check Hp
  if (!isInteger(hp))
    return error400Factory.invalidNumber('hp', 'an integer').setStatus(res);

  // Check armorClass
  if (!isPositiveInteger(armorClass))
    return error400Factory.invalidNumber('armorClass', 'a positive integer').setStatus(res);

  next();

  // Check if the new value for the slot enchantment level does not exceed the maxSlots  
  if (session!.characterUIDs?.includes(entityId)) { 
    
    const player = await new RepositoryFactory().characterRepository().getById(entityId);

    for (let i = 0; i <= 8; i++) {

      if (slots[i] !== 0) {
        
        const value = player?.slots[i] + slots[i];

        //if (value > player?.maxSlots[i])
        //  return error400Factory.noNewSlot(`The new value of level "${level}" slots exceeds your maximum number of slots for that level!`).setStatus(res);

      }
    
    }
  

  }

};