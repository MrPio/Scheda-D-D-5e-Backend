import { Request, Response, NextFunction } from 'express';

// Check mandatory parameter for GET/diceRoll
export const diceRollParameter = (req: Request, res: Response, next: NextFunction) => {
  const { diceList } = req.query;

  // Check if diceList is provided
  if (!diceList) 
    return res.status(400).json({ error: 'diceList is a required parameter.' });
  
  next();
};

// Check mandatory parameter for many routes
export const sessionIdParametr = (req: Request, res: Response, next: NextFunction) => {

  const { sessionId } = req.query;

  // Check if sessionId is provided
  if (!sessionId) 
    return res.status(400).json({ error: 'sessionId is a required parameter.' });

  next();
};

// Check mandatory parameter GET/sessions/{sessionId}/monsters/{monsterId}
export const monsterIdParametr = (req: Request, res: Response, next: NextFunction) => {

  const { monsterId } = req.query;

  // Check if sessionId is provided
  if (!monsterId) 
    return res.status(400).json({ error: 'monsterId is a required parameter.' });
  
  next();
};

// Check mandatory parameter 
export const entityIdParametr = (req: Request, res: Response, next: NextFunction) => {

  const { entityId } = req.query;

  // Check if entityId is provided
  if (!entityId) 
    return res.status(400).json({ error: 'entityId is a required parameter.' });

  next();
};

// Check mandatory parameter for POST/sessions/{sessionId}/history
export const historyParametr = (req: Request, res: Response, next: NextFunction) => {

  const { message } = req.query;

  // Check if message is provided
  if (!message) 
    return res.status(400).json({ error: 'message is a required parameter.' });
  
  next();
};

// Check mandatory parameter for PATCH/sessions/{sessionId}/entity
export const EntityParametr = (req: Request, res: Response, next: NextFunction) => {

  const { entityType } = req.query;

  // Check if entity is provided
  if (!entityType) {
    return res.status(400).json({ error: 'entityType is a required parameter.' });

    // Check if the parametr name is provided for a Npc or a Character
  } else if (entityType === 'Npc' || entityType === 'Character') {

    const { name } = req.query;

    if (!name) 
      return res.status(400).json({ error: 'name is a required parameter.' });
    
    // Check if the parameters for Monster are provided
  } else {

    const { name, maxHp, armorClass, speed, valueStrength, valueDexterity, valueIntelligence, valueWisdom, valueCharisma, valueConstitution } = req.query;

    if (!name) 
      return res.status(400).json({ error: 'name is a required parameter.' });
    
    if (!maxHp) 
      return res.status(400).json({ error: 'maxHp is a required parameter.' });
    
    if (!armorClass) 
      return res.status(400).json({ error: 'armorClass is a required parameter.' });
    
    if (!speed) 
      return res.status(400).json({ error: 'speed is a required parameter.' });
    
    if (!valueStrength) 
      return res.status(400).json({ error: 'valueStrength is a required parameter.' });
    
    if (!valueDexterity) 
      return res.status(400).json({ error: 'valueDexterity is a required parameter.' });
    
    if (!valueIntelligence) 
      return res.status(400).json({ error: 'valueIntelligence is a required parameter.' });
    
    if (!valueWisdom) 
      return res.status(400).json({ error: 'valueWisdom is a required parameter.' });
    
    if (!valueCharisma) 
      return res.status(400).json({ error: 'valueCharisma is a required parameter.' });
    
    if (!valueConstitution) 
      return res.status(400).json({ error: 'valueConstitution is a required parameter.' });

  }

  next();
};

// Check mandatory parameter for GET/sessions/{sessionId}/savingThrow
export const savingThrowParameter = (req: Request, res: Response, next: NextFunction) => {

  const { entitiesId, difficultyClass, skill } = req.query;

  const isNonEmptyArrayOfStrings = (input: unknown): input is string[] => {
    return Array.isArray(input) && input.length > 0 && input.every(item => typeof item === 'string');
  };

  // Ensure entitiesId is a non-empty array of strings
  if (!isNonEmptyArrayOfStrings(entitiesId))
    return res.status(400).json({ error: 'entitiesId must be a non-empty list.' });
  
  if (!difficultyClass)
    return res.status(400).json({ error: 'difficultyClass is a required parameter.' });


  if (!skill)
    return res.status(400).json({ error: 'skill is a required parameter.' });

  next();
};

export const attackParameter = (req: Request, res: Response, next: NextFunction) => {

  const { attackType, attackerId } = req.query;

  if (!attackType)
    return res.status(400).json({ error: 'attackType is a required parameter.' });

  if (!attackerId)
    return res.status(400).json({ error: 'attackerId is a required parameter.' });

  if (attackType === 'attack') {

    const { targetId, attackRoll, weapon } = req.query;

    if (!targetId)
      return res.status(400).json({ error: 'targetId is a required parameter.' });

    if (!attackRoll)
      return res.status(400).json({ error: 'attackRoll is a required parameter.' });

    if (!weapon)
      return res.status(400).json({ error: 'weapon is a required parameter.' });

  }

  if (attackType === 'damageEnchantment') {

    const { enchantment, targetId, attackRoll, slotLevel } = req.query;

    if (!enchantment)
      return res.status(400).json({ error: 'enchantment is a required parameter.' });

    if (!targetId)
      return res.status(400).json({ error: 'targetId is a required parameter.' });

    if (!attackRoll)
      return res.status(400).json({ error: 'attackRoll is a required parameter.' });

    if (!slotLevel)
      return res.status(400).json({ error: 'slotLevel is a required parameter.' });
  }

  if (attackType === 'savingThrowEnchantment') {

    const { enchantment, targetsId, difficultyClass, skill, slotLevel } = req.query;

    if (!enchantment)
      return res.status(400).json({ error: 'enchantment is a required parameter.' });

    const isNonEmptyArrayOfStrings = (input: unknown): input is string[] => {
      return Array.isArray(input) && input.length > 0 && input.every(item => typeof item === 'string');
    };
  
    if (!isNonEmptyArrayOfStrings(targetsId))
      return res.status(400).json({ error: 'entitiesId must be a non-empty list.' });

    if (!difficultyClass)
      return res.status(400).json({ error: 'difficultyClass is a required parameter.' });

    if (!skill)
      return res.status(400).json({ error: 'skill is a required parameter.' });

    if (!slotLevel)
      return res.status(400).json({ error: 'slotLevel is a required parameter.' });
    
  }

  if (attackType === 'descriptiveEnchantment') {

    const { enchantment, slotLevel } = req.query;

    if (!enchantment)
      return res.status(400).json({ error: 'enchantment is a required parameter.' });

    if (!slotLevel)
      return res.status(400).json({ error: 'slotLevel is a required parameter.' });
    
  }

  next();
};