import { DocumentData } from 'firebase-admin/firestore';
import { JSONSerializable, IWithUID } from '../db/firestore';
import IEntity from './entity';
import { Effect } from './effect';
import { Skill } from './monster_skill';

/**
 * Represents a non-player character (NPC) in the game.
 * An NPC is an entity with various attributes including health points, skills, and effects.
 */
export default class NPC extends JSONSerializable implements IWithUID, IEntity {

  /**
   * Constructor to initialize the NPC with specified attributes.
   * @param authorUID - The unique identifier of the author.
   * @param _name - The name of the NPC.
   * @param _maxHp - The maximum health points of the NPC.
   * @param _hp - The current health points of the NPC.
   * @param armorClass - The armor class of the NPC.
   * @param enchantments - List of enchantments applied to the NPC.
   * @param isReactionActivable - Indicates if the NPC's reaction can be activated.
   * @param speed - The movement speed of the NPC.
   * @param weapons - List of weapons possessed by the NPC.
   * @param skills - Skills associated with the NPC.
   * @param skillsModifier - Modifiers for each skill of the NPC.
   * @param effects - Effects currently applied to the NPC.
   * @param level - The level of the NPC.
   * @param uid - The unique identifier of the NPC.
   */
  constructor(
    public authorUID: string,
    public _name: string,
    public _maxHp: number,
    public _hp: number,
    public armorClass: number,
    public enchantments: string[],
    public isReactionActivable: boolean,
    public speed: number,
    public weapons: string[],
    public skills: { [key: string]: number },
    public skillsModifier: { [key: string]: number },
    public effects?: Effect[],
    public level?: number,
    public uid?: string,
  ) { super(); }

  /**
   * Creates an NPC instance from a JSON object.
   * @param json - The JSON data to initialize the NPC.
   * @returns An instance of `NPC`.
   */
  static fromJSON(json: DocumentData): NPC {
    return new NPC(
      json.authorUID,
      json._name,
      json._maxHP,
      json._hp,
      json.armorClass,
      json.enchantments ?? [],
      json.isReactionActivable ?? true,
      json.speed,
      (json._inventory as string[]).filter(it => it.includes('Weapon.')).map(it => it.split('Weapon.')[1]) ?? [],
      json.skills ?? Object.values(Skill).reduce((acc, key) => ({ ...acc, [key]: 0 }), {}),
      json.skillsModifier ?? Object.values(Skill).reduce((acc, key) => ({ ...acc, [key]: 0 }), {}),
      json.effects ?? [],
    );
  }

  /**
   * Determines if the NPC is considered dead based on its health points.
   * A NPC is dead if its health points are less than or equal to zero.
   * @returns True if the NPC is dead, otherwise false.
   */
  get isDead(): boolean {
    return this._hp <= 0;
  }
}