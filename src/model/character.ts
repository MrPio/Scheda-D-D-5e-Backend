import { DocumentData } from 'firebase-admin/firestore';
import { JSONSerializable, IWithUID } from '../db/firestore';
import IEntity from './entity';
import { Effect } from './effect';
import { Skill } from './monster_skill';

/**
 * Represents a character with various attributes, including health, skills, and equipment.
 * Implements `JSONSerializable` for converting to and from JSON, and `IWithUID` for unique identification.
 */
export default class Character extends JSONSerializable implements IWithUID, IEntity {

  /**
   * Creates a new instance of Character.
   * @param authorUID - Unique identifier for the creator of the character.
   * @param _name - Name of the character.
   * @param _maxHp - Maximum health points of the character.
   * @param _hp - Current health points of the character.
   * @param armorClass - Armor class value, representing the character's defense.
   * @param enchantments - List of enchantments applied to the character.
   * @param isReactionActivable - Boolean indicating if the character's reaction can be activated.
   * @param speed - Movement speed of the character.
   * @param weapons - List of weapons the character possesses.
   * @param skills - Dictionary of skills and their values.
   * @param skillsModifier - Dictionary of skill modifiers and their values.
   * @param deathRolls - Array of booleans indicating if death rolls are enabled for the character.
   * @param slots - Dictionary of slots and their values.
   * @param maxSlots - Dictionary of maximum slots and their values.
   * @param effects - Array of effects applied to the character.
   * @param uid - Optional unique identifier for the character.
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
    public deathRolls: boolean[],
    public slots: { [key: number]: number },
    public maxSlots: { [key: number]: number },
    public effects?: Effect[],
    public uid?: string,
  ) { super(); }

  /**
   * Creates a `Character` instance from a JSON object.
   * @param json - JSON data representing a character.
   * @returns A new `Character` instance.
   */
  static fromJSON(json: DocumentData): Character {
    return new Character(
      json.authorUID,
      json._name,
      json._maxHP,
      json._hp,
      json.armorClass,
      json.enchantments ?? [],
      json.isReactionActivable ?? true,
      json.speed,
      Object.keys(json._inventory).filter(it => it.includes('Weapon.')).map(it => it.split('Weapon.')[1]) ?? [],
      json.skills ?? Object.values(Skill).reduce((acc, key) => ({ ...acc, [key]: 0 }), {}),
      json.skillsModifier ?? Object.values(Skill).reduce((acc, key) => ({ ...acc, [key]: 0 }), {}),
      json.deathRolls ?? [],
      json.slots ?? Array.from({ length: 9 }, (_, i) => ({ [i]: 0 })).reduce((acc, cur) => ({ ...acc, ...cur }), {}),
      json.maxSlots ?? Array.from({ length: 9 }, (_, i) => ({ [i]: 0 })).reduce((acc, cur) => ({ ...acc, ...cur }), {}),
      json.effects ?? [],
    );
  }

  /**
   * Checks if the character is dead based on its current and maximum health points.
   * @returns True if the character's health points are less than or equal to the negative 
   * of maximum health points, otherwise false.
   */
  get isDead(): boolean {
    return this._hp <= -this._maxHp;
  }
}