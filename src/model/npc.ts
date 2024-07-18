import { DocumentData } from 'firebase-admin/firestore';
import { JSONSerializable, IWithUID } from '../db/firestore';
import IEntity from './entity';
import { Effect } from './effect';
import { Skill } from './monster_skill';

export default class NPC extends JSONSerializable implements IWithUID, IEntity {

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

  get isDead(): boolean {
    return this._hp <= 0;
  }
}