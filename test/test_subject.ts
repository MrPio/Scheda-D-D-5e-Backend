import { Subject } from "rxjs";
import { Dice } from "../src/model/dice";
import { randomInt } from "crypto";

console.log(
  Object.values(Dice).filter(value => typeof value === 'number').flatMap(item => Array(10).fill(item))
    .sort(() => 0.5 - Math.random()).slice(0, randomInt(1, 5)));