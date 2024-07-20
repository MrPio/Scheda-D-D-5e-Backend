import { Model, Column, Table, BelongsTo, ForeignKey, HasMany, DataType } from 'sequelize-typescript';
import { Effect } from './effect';
import { Session } from './session';
import { MonsterSkill } from './monster_skill';
import IEntity from './entity';


/**
 * Represents a monster in a combat session.
 * A monster is a disposable `Entity` that the master may add at the beginning of each combat `Session`.
 */
@Table({
  tableName: 'monsters',
  timestamps: true,
})
export class Monster extends Model<Monster> implements IEntity {
  @Column declare _name: string;

  @Column declare authorUID: string;

  @Column declare _maxHp: number;

  @Column declare _hp: number;

  @Column declare armorClass: number;

  @Column(DataType.ARRAY(DataType.STRING)) declare enchantments: string[];

  @Column declare isReactionActivable: boolean;

  @Column(DataType.FLOAT) declare speed: number;

  @Column(DataType.ARRAY(DataType.STRING)) declare weapons: string[];

  @Column(DataType.ARRAY(DataType.STRING)) declare effects?: Effect[];

  @Column(DataType.ARRAY(DataType.STRING)) declare effectImmunities?: Effect[];

  @ForeignKey(() => Session)
  @Column declare sessionId: number;

  @BelongsTo(() => Session)
  declare session: Session;

  @HasMany(() => MonsterSkill)
  declare skills: MonsterSkill[];

  /**
   * Determines if the monster is considered dead based on its health points.
   * A monster is dead if its health points are less than or equal to zero.
   */
  get isDead(): boolean {
    return this._hp <= 0;
  }
}