import { Response, NextFunction } from 'express';
import { Dice } from '../model/dice';
import { Error400Factory } from '../error/error_factory';
import { IAugmentedRequest } from '../api';

const error400Factory: Error400Factory = new Error400Factory();

/**
 * Check the validity of a dice roll request.
 */
export const checkDiceRoll = (req: IAugmentedRequest, res: Response, next: NextFunction) => {
  const diceList: string[] = req.body.diceList;
  const modifier = (req.body.modifier ?? 0) as number;

  // Check if diceList is an array
  if (!Array.isArray(diceList))
    return error400Factory.wrongParameterType('diceList', 'string[]').setStatus(res);

  // Check if diceList contains existing dice
  for (const dice of diceList)
    if (!(dice in Dice))
      return error400Factory.diceNotFound(dice).setStatus(res);

  // Check if modifier is an integer
  if (!Number.isInteger(modifier))
    return error400Factory.wrongParameterType('modifier', 'number').setStatus(res);

  // If all checks pass, proceed to the next middleware or route handler
  next();
};