import { DocumentData } from 'firebase-admin/firestore';
import { JSONSerializable, WithUID } from '../db/firestore';
import Entity from './entity';
import { Effect } from './effect';
import { Skill } from './monster_skill';



export default class Character extends JSONSerializable implements WithUID, Entity {

  constructor(
    public userUID: string,
    public name: string,
    public maxHp: number,
    public hp: number,
    public ac: number,
    public enchantments: string[],
    public isReactionActivable: boolean,
    public speed: number,
    public weapons: string[],
    public skills: Map<Skill, number>,
    public skillsModifier: Map<Skill, number>,
    public effect?: Effect,
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
      (json._inventory as string[]).filter(it => it.includes('Weapon.')).map(it => it.split('Weapon.')[1]) ?? [],
      json.skills ?? new Map(Object.entries(Object.values(Skill).filter(value => typeof value === 'string').reduce((acc, key) => ({ ...acc, [key]: 0 }), {}))) as unknown as Map<Skill, number>,
      json.skillsModifier ?? new Map(Object.entries(Object.values(Skill).filter(value => typeof value === 'string').reduce((acc, key) => ({ ...acc, [key]: 0 }), {}))) as unknown as Map<Skill, number>,
      json.effect ?? null,
    );
  }
}