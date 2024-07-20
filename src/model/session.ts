import { Model, Column, Table, HasMany, DataType } from 'sequelize-typescript';
import { EntityTurn } from './entity_turn';
import { Monster } from './monster';
import { HistoryMessage } from './history_message';

// The different states that a session can be in during its life cycle.
export enum SessionStatus {
  created = 'creata',
  ongoing = 'inCorso',
  paused = 'inPausa',
  ended = 'terminata',
}

/**
 * Represents a session in the game.
 * A session is a gameplay instance where entities interact with each other.
 */
@Table({
  tableName: 'sessions',
  timestamps: true,
})
export class Session extends Model<Session> {
  static minMapSize = { height: 10, width: 10 };

  static maxMapSize = { height: 100, width: 100 };

  @Column declare name: string;

  @Column declare masterUID: string;

  @Column(DataType.ARRAY(DataType.STRING)) declare characterUIDs?: string[];

  @Column(DataType.ARRAY(DataType.STRING)) declare npcUIDs?: string[];

  @Column(DataType.ARRAY(DataType.STRING)) declare userUIDs?: string[];

  @Column(DataType.ARRAY(DataType.STRING)) declare onlineUserUIDs?: string[];

  @Column declare campaignName?: string;

  @Column declare currentEntityUID?: string;

  @Column declare sessionStatus?: SessionStatus;

  @Column(DataType.JSON) declare mapSize?: { width: number, height: number };

  @HasMany(() => HistoryMessage)
  declare history: HistoryMessage[];

  @HasMany(() => Monster)
  declare monsters: Monster[];

  @HasMany(() => EntityTurn)
  declare entityTurns: EntityTurn[];

  /**
   * Returns the list of monster unique identifiers in the session.
   * @returns An array of monster unique identifiers.
   */
  get monsterUIDs(): string[] {
    return this.monsters.map(it => it.id);
  }
}