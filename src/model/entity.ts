import Character from './character';
import { Effect } from './effect';
import { Monster } from './monster';
import NPC from './npc';

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

// Utility function to retrieve the id of an entity
export const getEntityId = (entity:IEntity)=>
  'id' in entity ? (entity as Monster).id.toString() : (entity as Character | NPC).uid;

// The three possible types of entity
export enum EntityType {
  character = 'character',
  npc = 'npc',
  monster = 'monster',
}