import { Effect } from './effect';

// Interface defining the attributes of an entity
export default interface IEntity {
  authorUID: string;
  _name: string;
  _maxHp: number;
  _hp: number;
  armorClass: number;
  enchantments: string[];
  isReactionActivable: boolean;
  speed: number;
  weapons: string[];
  effects?: Effect[];
  get isDead(): boolean;
}

// The three possible types of entity
export enum EntityType {
  character = 'character',
  npc = 'npc',
  monster = 'monster',
}