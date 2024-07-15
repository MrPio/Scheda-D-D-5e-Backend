import { Model, Column, Table, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Monster } from './monster';

// The six different skills
export enum Skill {
  strength,
  dexterity,
  intelligence,
  wisdom,
  charisma,
  constitution,
}

@Table({
  tableName: 'monster_skills',
})
export class MonsterSkill extends Model<MonsterSkill> {
  @Column declare skill: Skill;

  @Column declare value: number;

  @ForeignKey(() => Monster)
  @Column declare monsterId: number;

  @BelongsTo(() => Monster)
  declare monster: Monster;
}