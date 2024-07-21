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
 * Represents the skills associated with a monster.
 * Each monster has a value for each of the six skills defined in the `Skill` enum.
 * monster (0,6)<------>(1,1) monster_skills
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