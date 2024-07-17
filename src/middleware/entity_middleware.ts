import { Request, Response, NextFunction } from 'express';
import { Effect } from '../model/effect';
import { RepositoryFactory } from '../repository/repository_factory';

// Utility function to check if a value is a positive integer
function isPositiveInteger(value: number): boolean {
  const number = Number(value);
  return Number.isInteger(number) && number > 0;
}

// Utility function to check if a value is an integer
function isInteger(value: number): boolean {
  const number = Number(value);
  return Number.isInteger(number);
}

// Utility function to check if a value is positive and divisible by 1.5
function isValidSpeed(value: number): boolean {
  const number = Number(value);
  return number > 0 && number % 1.5 === 0;
}
  
// Utility function to check if a value is an integer between 1 and 30
function isValidAttributeValue(value: number): boolean {
  const number = Number(value);
  return Number.isInteger(number) && number >= 1 && number <= 30;
}

// Middleware function to validate the add of an entity
export const addEntity = async (req: Request, res: Response, next: NextFunction) => {
  
  const { sessionId } = req.query;
  const sessionID = String(sessionId);
  const session = await new RepositoryFactory().sessionRepository().getById(sessionID);
  if (!session) {
    return res.status(400).json({ error: 'Session not found' });
  }

  const { entityType } = req.query;
    
  // Check if the message is of the intended type
  if (entityType !== 'Npc' && entityType !== 'Monster' && entityType !== 'Character') {
    return res.status(400).json({ error: 'Invalid entityType. It must be one of the following values: Npc, Monster, Characters' });
  }

  // Check if the entity is a Monster
  if (entityType === 'Monster') {
    const { maxHp, armorClass, enchantments, weapons, effectImmunities, speed, strength, dexterity, intelligence, wisdom, charisma, constitution } = req.query;

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
      return res.status(400).json({ error: 'maxHp must be a positive integer.' });
    }

    // Check armorClass
    if (!isPositiveInteger(parsedArmorClass)) {
      return res.status(400).json({ error: 'armorClass must be a positive integer.' });
    }

    // Check speed
    if (!isValidSpeed(parsedSpeed)) {
      return res.status(400).json({ error: 'speed must be a positive number divisible by 1.5.' });
    }
    
    // Check skillValues
    if (!isValidAttributeValue(valueStrength)) {
      return res.status(400).json({ error: 'valueStrength must be an integer between 1 and 30.' });
    }
    if (!isValidAttributeValue(valueDexterity)) {
      return res.status(400).json({ error: 'valueDexterity must be an integer between 1 and 30.' });
    }
    if (!isValidAttributeValue(valueIntelligence)) {
      return res.status(400).json({ error: 'valueIntelligence must be an integer between 1 and 30.' });
    }
    if (!isValidAttributeValue(valueWisdom)) {
      return res.status(400).json({ error: 'valueWisdom must be an integer between 1 and 30.' });
    }
    if (!isValidAttributeValue(valueCharisma)) {
      return res.status(400).json({ error: 'valueCharisma must be an integer between 1 and 30.' });
    }
    if (!isValidAttributeValue(valueConstitution)) {
      return res.status(400).json({ error: 'valueConstitution must be an integer between 1 and 30.' });
    }  

    // Check effectImmunities
    if (!Array.isArray(effectImmunities)) {
      return res.status(400).json({ error: 'effectImmunities must be a list of effects.' });
    }

    // Check if the element is a valid value based on the enum Effect. 
    for (const element of effectImmunities as string[]) {
      if (!validEffect.includes(element)) {
        return res.status(400).json({ error: `Invalid dice in the list: ${element}. The dice must be one of the following values: ${validEffect.join(', ')}.` });
      }
    }

    // Check enchantments
    if (enchantments) {

      if (!Array.isArray(enchantments)) {
        return res.status(400).json({ error: 'enchantments must be a list of string.' });
      }

      const enchantmentRepository = new RepositoryFactory().enchantmentRepository();
    
      // Verify the name of the enchantments
      for (const enchantmentId of enchantments) {
        const enchantment = await enchantmentRepository.getById(enchantmentId);
        if (!enchantment) {
          return res.status(400).json({ error: `enchantment not found: ${enchantmentId}` });
        }
      }
      
    }

    // Check weapons
    if (weapons) {
      if (!Array.isArray(weapons)) {
        return res.status(400).json({ error: 'weapons must be a list.' });
      }

    }
  }

  // Check if the entity is a Character
  if (entityType === 'Character') {

    const { uid } = req.query;
    const Uid = String(uid);

    const character = await new RepositoryFactory().characterRepository().getById(Uid);
    if (!character) {
      return res.status(400).json({ error: 'The character is not found' }); 
    }

    if (session.entityUIDs?.includes(Uid)) {
      return res.status(400).json({ error: 'The character is already in the battle' }); 
    }
    //const character = await new RepositoryFactory().npcRepository().getById(uid);
    
  }

  // Check if the entity is a Npc
  if (entityType === 'Npc') {

    const { uid } = req.query;
    const Uid = String(uid);

    const npc = await new RepositoryFactory().npcRepository().getById(Uid);
    if (!npc) {
      return res.status(400).json({ error: 'The npc is not found' }); 
    }

    if (session.entityUIDs?.includes(Uid)) {
      return res.status(400).json({ error: 'Npc is already in the battle' });
    }
  }
   
  
  
  next();
};

// Middleware function to validate the get of monster info & the elimination of an entity & before modifying an entity
export const getEntity = async (req: Request, res: Response, next: NextFunction) => {

  const { uid, sessionId } = req.query;
  const sessionID = String(sessionId);
  const Uid = String(uid);

  const session = await new RepositoryFactory().sessionRepository().getById(sessionID);
  if (!session) {
    return res.status(400).json({ error: 'session not found' });
  }

  if (!session.entityUIDs?.includes(Uid)) {
    return res.status(400).json({ error: 'entity not found' });
  }

  next();
};

// Middleware function to validate modifications of an entity
export const modifyEntity = async (req: Request, res: Response, next: NextFunction) => {

  const { uid, sessionId } = req.query;
  const sessionID = String(sessionId);
  const Uid = String(uid);

  const session = await new RepositoryFactory().sessionRepository().getById(sessionID);
  if (!session) {
    return res.status(400).json({ error: 'session not found' });
  }

  const entity = session.entityUIDs?.includes(Uid);
  if (!entity) {
    return res.status(400).json({ error: 'entity not found' });
  }

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