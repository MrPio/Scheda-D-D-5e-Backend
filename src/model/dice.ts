import { randomInt } from 'crypto';

/**
 * Enum representing different types of dice used in games or simulations.
 * Each member corresponds to a specific die with a given number of sides.
 */
export enum Dice {
  d2 = 2,
  d4 = 4,
  d6 = 6,
  d8 = 8,
  d10 = 10,
  d12 = 12,
  d20 = 20,
  d100 = 100,
}

// Get a random number, between min and max, of dice.
export const getSomeDice = (min: number, max: number): Dice[] =>
  Object.values(Dice).filter(value => typeof value === 'number').flatMap(item => Array(max).fill(item))
    .sort(() => 0.5 - Math.random()).slice(0, randomInt(min, max));