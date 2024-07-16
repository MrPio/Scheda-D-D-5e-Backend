import { Model, Column, Table, BelongsTo, ForeignKey, HasMany, DataType } from 'sequelize-typescript';
import { Effect } from './effect';
import { Session } from './session';
import { MonsterSkill } from './monster_skill';

@Table({
  tableName: 'monsters',
  timestamps: true,
})
export class Monster extends Model<Monster> {
  @Column declare name: string;

  @Column declare userUID: string;

  @Column declare maxHp?: number;

  @Column declare hp: number;

  @Column declare ac?: number;

  @Column(DataType.ARRAY(DataType.STRING)) declare enchantments?: string[];

  @Column declare isReactionActivable?: boolean;

  @Column declare speed?: number;

  @Column(DataType.ARRAY(DataType.STRING)) declare weapons?: string[];

  @Column(DataType.ARRAY(DataType.STRING)) declare effects?: Effect[];

  @Column(DataType.ARRAY(DataType.STRING)) declare effectImmunities?: Effect[];

  @ForeignKey(() => Session)
  @Column declare sessionId: number;

  @BelongsTo(() => Session)
  declare session: Session;

  @HasMany(() => MonsterSkill)
  declare skills: MonsterSkill[];

  get isDead(): boolean {
    return this.hp <= 0;
  }
}
