import { DocumentData } from 'firebase-admin/firestore';
import { JSONSerializable, WithUID } from '../db/firestore';
import Entity from './entity';
import { Effect } from './effect';
import { Skill } from './monster_skill';

export default class Character extends JSONSerializable implements WithUID, Entity {

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

  static fromJSON(json: DocumentData): Character {
    return new Character(
      json.authorUID,
      json._name,
      json._maxHP,
      json._hp,
      json.armorClass,
      json.enchantments ?? [],
      json.isReactionActivable ?? false,
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

  get isDead(): boolean {
    return this._hp <= -this._maxHp;
  }
}