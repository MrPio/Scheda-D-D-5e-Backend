import { Request, Response, NextFunction } from 'express';
import { Effect } from '../model/effect';
import { RepositoryFactory } from '../repository/repository_factory';
import { Monster } from '../model/monster';

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
  
    
  // Check if the entity type is correct
  if (entityType !== 'npc' && entityType !== 'monster' && entityType !== 'character') {
    return res.status(400).json({ error: 'EntityType must be one of the following values: "npc", "monster", "character"!' });
  }

  // Check if the entity is a Monster
  if (entityType === 'monster') {
    const { maxHp, armorClass, enchantments, weapons, effectImmunities, speed, strength, dexterity, intelligence, wisdom, charisma, constitution } = req.body;

    // Convert values ​​to numbers
    const parsedMaxHp = Number(maxHp);
    const parsedArmorClass = Number(armorClass);
    const parsedSpeed = Number(speed);
    const valueStrength = Number(strength);
    const valueDexterity = Number(dexterity);
    const valueIntelligence = Number(intelligence);
    const valueWisdom = Number(wisdom);
    const valueCharisma = Number(charisma);
    const valueConstitution = Number(constitution);

    // Convert enum values to an array of strings
    const validEffect = Object.values(Effect) as string[];

    // Check maxHp
    if (!isPositiveInteger(parsedMaxHp)) {
      return res.status(400).json({ error: 'maxHp must be a positive integer!' });
    }

    // Check armorClass
    if (!isPositiveInteger(parsedArmorClass)) {
      return res.status(400).json({ error: 'armorClass must be a positive integer!' });
    }

    // Check speed
    if (!isValidSpeed(parsedSpeed)) {
      return res.status(400).json({ error: 'speed must be a positive number divisible by 1.5!' });
    }
    
    // Check skillValues
    if (!isValidAttributeValue(valueStrength)) {
      return res.status(400).json({ error: 'valueStrength must be an integer between 1 and 30!' });
    }
    if (!isValidAttributeValue(valueDexterity)) {
      return res.status(400).json({ error: 'valueDexterity must be an integer between 1 and 30!' });
    }
    if (!isValidAttributeValue(valueIntelligence)) {
      return res.status(400).json({ error: 'valueIntelligence must be an integer between 1 and 30!' });
    }
    if (!isValidAttributeValue(valueWisdom)) {
      return res.status(400).json({ error: 'valueWisdom must be an integer between 1 and 30!' });
    }
    if (!isValidAttributeValue(valueCharisma)) {
      return res.status(400).json({ error: 'valueCharisma must be an integer between 1 and 30!' });
    }
    if (!isValidAttributeValue(valueConstitution)) {
      return res.status(400).json({ error: 'valueConstitution must be an integer between 1 and 30!' });
    }  

    // Check effectImmunities
    if (!Array.isArray(effectImmunities)) {
      return res.status(400).json({ error: 'effectImmunities must be a list of effects!' });
    }

    // Check if the element is a valid value based on the enum Effect. 
    for (const element of effectImmunities as string[]) {
      if (!validEffect.includes(element)) {
        return res.status(400).json({ error: `Invalid effect in the list: ${element}. The effect must be one of the following values: ${validEffect.join(', ')}!` });
      }
    }

    // Check enchantments
    if (enchantments) {

      if (!Array.isArray(enchantments)) {
        return res.status(400).json({ error: 'enchantments must be a list of string!' });
      }

      const enchantmentRepository = new RepositoryFactory().enchantmentRepository();
    
      // Verify the name of the enchantments
      for (const enchantmentId of enchantments) {
        const enchantmentIdStr = String(enchantmentId); // Ensure enchantmentId is a string
        const enchantment = await enchantmentRepository.getById(enchantmentIdStr);
        if (!enchantment) {
          return res.status(400).json({ error: `Enchantment ${enchantmentId} not found!` });
        }
      }
      
    }

    // Check weapons
    if (weapons) {
      if (!Array.isArray(weapons)) {
        return res.status(400).json({ error: 'weapons must be a list!' });
      }

    }
  }

  // Check if the entity is a Character
  if (entityType === 'character') {

    const { uid } = req.body;

    const character = await new RepositoryFactory().characterRepository().getById(uid);
    if (!character) {
      return res.status(400).json({ error: 'Character not found!' }); 
    }

    if (session!.characterUIDs?.includes(uid)) {
      return res.status(400).json({ error: 'Character already in the battle!' }); 
    }
    
  }

  // Check if the entity is a Npc
  if (entityType === 'npc') {

    const { uid } = req.body;

    const npc = await new RepositoryFactory().npcRepository().getById(uid);
    if (!npc) {
      return res.status(400).json({ error: 'Npc not found!' }); 
    }

    if (session!.npcUIDs?.includes(uid)) {
      return res.status(400).json({ error: 'Npc already in the battle!' });
    }
  }
   
  next();
};

/**
 * Checks if the entity is in a session
 */
export const checkEntityInSession = async (req: Request, res: Response, next: NextFunction) => {
  const { entityId, sessionId } = req.params;

  const session = await new RepositoryFactory().sessionRepository().getById(sessionId);
  if (!session) {
    return res.status(400).json({ error: `Session ${sessionId} not found!` });
  }

  const isCharacter = session.characterUIDs?.includes(entityId);
  const isNpc = session.npcUIDs?.includes(entityId);
  const isMonster = session.monsters?.some((monster: Monster) => {
    return monster.id === parseInt(entityId, 10);
  });

  if (!isCharacter && !isNpc && !isMonster) {
    return res.status(400).json({ error: `Entity ${entityId} not found in session ${sessionId}!` });
  }

  next();
};



/**
 * Checks if an entity update is valid
 */
// TODO MrPio
export const checkUpdateEntity = async (req: Request, res: Response, next: NextFunction) => {

  const { entityId, sessionId } = req.params;

  const session = await new RepositoryFactory().sessionRepository().getById(sessionId);
  if (!session) {
    return res.status(400).json({ error: `Session ${sessionId} not found!` });
  }

  const entityInfo = req.body;

  // Convert enum values to an array of strings
  const validEffect = Object.values(Effect) as string[];
  const { hp, armorClass, speed, effects } = req.query;

  // Convert values ​​to numbers
  const parsedHp = Number(hp);
  const parsedArmorClass = Number(armorClass);
  const parsedSpeed = Number(speed);

  // Check effects
  if (!Array.isArray(effects)) {
    return res.status(400).json({ error: 'effects must be a list of effects.' });
  }

  // Check for any modification
  if (hp && !armorClass && !speed && !effects) {
    return res.status(400).json({ error: 'you need to change at least one parameter.' });
  }

  // Check if the element is a valid value based on the enum Effect. 
  for (const element of effects as string[]) {
    if (!validEffect.includes(element)) {
      return res.status(400).json({ error: `Invalid element in the list: ${element}. The list must contain at least one of the following values: ${validEffect.join(', ')}.` });
    }
  }

  // Check speed
  if (!isValidSpeed(parsedSpeed)) {
    return res.status(400).json({ error: 'speed must be a positive number divisible by 1.5.' });
  }

  // Check Hp
  if (!isInteger(parsedHp)) {
    return res.status(400).json({ error: 'hp must be a positive integer.' });
  }

  // Check armorClass
  if (!isPositiveInteger(parsedArmorClass)) {
    return res.status(400).json({ error: 'armorClass must be a positive integer.' });
  }

  next();
};