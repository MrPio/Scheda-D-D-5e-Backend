import { Effect } from './effect';

//Interface defining the attributes of an Entity
export default interface Entity {
  userUID: string;
  name: string;
  maxHp: number;
  hp: number;
  ac: number;
  enchantments: string[];
  isReactionActivable: boolean;
  speed: number;
  weapons: string[];
  effect?: Effect;
}
