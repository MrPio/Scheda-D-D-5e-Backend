import { AugmentedRequest } from '../api';
import { Response as Res } from 'express';
import { Dice } from '../model/dice';
import { randomInt } from 'crypto';

export async function diceRollService(req: AugmentedRequest, res: Res) {
  const { diceList, modifier } = req.body;

  // Parse diceList
  const diceValues: number[] = diceList.map((dice: string) => Object(Dice)[dice]);

  // Roll the dice
  const rollResult = diceValues.reduce((total, dice) => total + randomInt(dice) + 1, 0) + modifier;
  return res.json({ result: rollResult });
}


export async function makeAttackService(req: AugmentedRequest, res: Res) {
  // TODO
}

export async function getSavingThrowService(req: AugmentedRequest, res: Res) {
  // TODO
}

export async function addEffectService(req: AugmentedRequest, res: Res) {
  // TODO
}

export async function enableReactionService(req: AugmentedRequest, res: Res) {
  // TODO
}