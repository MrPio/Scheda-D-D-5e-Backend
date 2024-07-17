import { Request, Response, NextFunction } from 'express';

// Check mandatory parameter for GET/diceRoll
export const diceRollParameter = (req: Request, res: Response, next: NextFunction) => {
  const { diceList } = req.query;

  // Check if diceList is provided
  if (!diceList) {
    return res.status(400).json({ error: 'diceList is a required parameter.' });
  }

  next();
};

// Check mandatory parameter for many routes
export const sessionIdParametr = (req: Request, res: Response, next: NextFunction) => {

  const { sessionId } = req.query;

  // Check if sessionId is provided
  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is a required parameter.' });
  }

  next();
};

// Check mandatory parameter GET/sessions/{sessionId}/monsters/{monsterId}
export const monsterIdParametr = (req: Request, res: Response, next: NextFunction) => {

  const { monsterId } = req.query;

  // Check if sessionId is provided
  if (!monsterId) {
    return res.status(400).json({ error: 'monsterId is a required parameter.' });
  }

  next();
};

// Check mandatory parameter 
export const entityIdParametr = (req: Request, res: Response, next: NextFunction) => {

  const { entityId } = req.query;

  // Check if entityId is provided
  if (!entityId) {
    return res.status(400).json({ error: 'entityId is a required parameter.' });
  }

  next();
};

// Check mandatory parameter for POST/sessions/{sessionId}/history
export const historyParametr = (req: Request, res: Response, next: NextFunction) => {

  const { message } = req.query;

  // Check if message is provided
  if (!message) {
    return res.status(400).json({ error: 'message is a required parameter.' });
  }

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

    if (!name) {
      return res.status(400).json({ error: 'name is a required parameter.' });
    }

    // Check if the parameters for Monster are provided
  } else {

    const { name, maxHp, armorClass, speed, valueStrength, valueDexterity, valueIntelligence, valueWisdom, valueCharisma, valueConstitution } = req.query;

    if (!name) {
      return res.status(400).json({ error: 'name is a required parameter.' });
    }
    if (!maxHp) {
      return res.status(400).json({ error: 'maxHp is a required parameter.' });
    }
    if (!armorClass) {
      return res.status(400).json({ error: 'armorClass is a required parameter.' });
    }
    if (!speed) {
      return res.status(400).json({ error: 'speed is a required parameter.' });
    }
    if (!valueStrength) {
      return res.status(400).json({ error: 'valueStrength is a required parameter.' });
    }
    if (!valueDexterity) {
      return res.status(400).json({ error: 'valueDexterity is a required parameter.' });
    }
    if (!valueIntelligence) {
      return res.status(400).json({ error: 'valueIntelligence is a required parameter.' });
    }
    if (!valueWisdom) {
      return res.status(400).json({ error: 'valueWisdom is a required parameter.' });
    }
    if (!valueCharisma) {
      return res.status(400).json({ error: 'valueCharisma is a required parameter.' });
    }
    if (!valueConstitution) {
      return res.status(400).json({ error: 'valueConstitution is a required parameter.' });
    }

  }

  next();
};