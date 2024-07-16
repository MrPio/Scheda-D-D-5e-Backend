import { DocumentData } from 'firebase-admin/firestore';
import { JSONSerializable, WithUID } from '../db/firestore';
import Entity from './entity';
import { Effect } from './effect';
import { Skill } from './monster_skill';

export default class NPC extends JSONSerializable implements WithUID, Entity {

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
    public skills: Map<Skill, number>,
    public skillsModifier: Map<Skill, number>,
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
      json.isReactionActivable ?? false,
      json.speed,
      (json._inventory as string[]).filter(it => it.includes('Weapon.')).map(it => it.split('Weapon.')[1]) ?? [],
      json.skills ?? new Map(Object.entries(Object.values(Skill).filter(value => typeof value === 'string').reduce((acc, key) => ({ ...acc, [key]: 0 }), {}))) as unknown as Map<Skill, number>,
      json.skillsModifier ?? new Map(Object.entries(Object.values(Skill).filter(value => typeof value === 'string').reduce((acc, key) => ({ ...acc, [key]: 0 }), {}))) as unknown as Map<Skill, number>,
      json.effects ?? [],
    );
  }

  get isDead(): boolean {
    return this._hp <= 0;
  }
}