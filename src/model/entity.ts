import { Effect } from './effect'

//Interface defining the attributes of an Entity
export interface EntityAttributes {
  uid: string; 
  userUID: string;
  name: string;
  maxHp: number;
  hp: number;
  ac: number;
  enchantments: string[];
  isReactionActivable: boolean;
  speed: number;
  skills: Map<string, number>;
  weapons: string[];
  effect: Effect;
}
