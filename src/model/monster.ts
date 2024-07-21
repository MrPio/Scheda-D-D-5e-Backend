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
  // The name of the monster
  @Column declare _name: string;

  // The UID of the author
  @Column declare authorUID: string;

  // The maximum health points of the monster
  @Column declare _maxHp: number;

  // The current health points of the monster
  @Column declare _hp: number;

  // The armor class of the monster
  @Column declare armorClass: number;

  // The enchantments on the monster
  @Column(DataType.ARRAY(DataType.STRING)) declare enchantments: string[];

  // Indicates if the monster's reaction can be activated
  @Column declare isReactionActivable: boolean;

  // The speed of the monster
  @Column(DataType.FLOAT) declare speed: number;

  // The weapons the monster possesses
  @Column(DataType.ARRAY(DataType.STRING)) declare weapons: string[];

  // The effects on the monster
  @Column(DataType.ARRAY(DataType.STRING)) declare effects?: Effect[];

  // The effects to which the monster is immune
  @Column(DataType.ARRAY(DataType.STRING)) declare effectImmunities?: Effect[];

  // The foreign key referencing the session
  @ForeignKey(() => Session)
  @Column declare sessionId: number;

  // The session to which the monster belongs
  @BelongsTo(() => Session)
  declare session: Session;

  // The skills associated with the monster
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
