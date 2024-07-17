import { RequestWithToken } from '../api';
import { Response as Res } from 'express';
import { randomInt } from 'crypto'; // For generating random numbers

export async function diceRollService(req: RequestWithToken, res: Res) {
  const { diceList, modifier } = req.query;
  // TODO: remove error check here and use middleware
  
  // Check if the parameters are defined
  if (!diceList || !modifier) {
    return res.status(400).json({ error: 'diceList and modifier are required' });
  }

  // Parse diceList
  const diceArray = (diceList as string).split(',').map(dice => {
    const [count, type] = dice.split('d').map(Number);
    return { count, type };
  });

  // Check if diceArray is valid
  if (diceArray.some(dice => isNaN(dice.count) || isNaN(dice.type))) {
    return res.status(400).json({ error: 'Invalid diceList format' });
  }

  // Convert the modifier to a number, it can be positive or negative
  const mod = parseFloat(modifier as string);
  if (isNaN(mod)) {
    return res.status(400).json({ error: 'Invalid modifier' });
  }

  // Roll the dice
  let total = 0;
  diceArray.forEach(dice => {
    for (let i = 0; i < dice.count; i++) {
      total += randomInt(1, dice.type + 1);
    }
  });

  // Add the modifier to the total
  total += mod;

  // Return the result
  res.status(200).json({ result: total });
}


export async function makeAttackService(req: RequestWithToken, res: Res) {
  // TODO
}

export async function getSavingThrowService(req: RequestWithToken, res: Res) {
  // TODO
}