import { Model, Column, Table, BelongsTo, ForeignKey, PrimaryKey } from 'sequelize-typescript';
import { Monster } from './monster';

// The six different skills
export enum Skill {
  strength = 'forza',
  dexterity = 'destrezza',
  intelligence = 'intelligenza',
  wisdom = 'saggezza',
  charisma = 'carisma',
  constitution = 'costituzione',
}

/**
 * monster (0,6)<------>(1,1) monster_skills
 * 
 * Each `Monster` has a value for each of the six `Skill`.
 */
@Table({
  tableName: 'monster_skills',
})
export class MonsterSkill extends Model<MonsterSkill> {
  @PrimaryKey
  @Column declare skill: Skill;

  @Column declare value: number;

  @PrimaryKey
  @ForeignKey(() => Monster)
  @Column declare monsterId: number;

  @BelongsTo(() => Monster)
  declare monster: Monster;
}