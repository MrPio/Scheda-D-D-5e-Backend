import { Request, Response, NextFunction } from 'express';
import { Dice } from '../model/dice';

// Middleware function to validate the dice roll parameters
const diceRollMiddleware = (req: Request, res: Response, next: NextFunction) => {

  // Convert enum values to an array of strings
  const validDice = Object.values(Dice) as string[];
  let { modifier } = req.query;
  const { diceList } = req.query;

  // If modifier is empty, set it to 0
  if (!modifier) {
    modifier = '0';
  }

  // Check if modifier is an integer
  if (isNaN(Number(modifier)) || !Number.isInteger(Number(modifier))) {
    // If not, respond with a 400 status and an error message
    return res.status(400).json({ error: 'Modifier must be an integer.' });
  }

  // Check if diceList is an array
  if (!Array.isArray(diceList)) {
    return res.status(400).json({ error: 'diceList must be a list.' });
  }

  //check if the die is a valid value based on the enum Dice. 
  for (const die of diceList as string[]) {
    if (!validDice.includes(die)) {
      return res.status(400).json({ error: `Invalid dice in the list: ${die}. The dice must be one of the following values: ${validDice.join(', ')}.` });
    }
  }
  
  // If all checks pass, proceed to the next middleware or route handler
  next();
};

export default diceRollMiddleware;