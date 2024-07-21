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

  // The minimum size of the combat map
  static minMapSize = { height: 10, width: 10 };

  // The maximum size of the combat map
  static maxMapSize = { height: 100, width: 100 };

  // The name of the session
  @Column declare name: string;

  // The UID of the master
  @Column declare masterUID: string;

  // List of character UIDs associated with the session
  @Column(DataType.ARRAY(DataType.STRING)) declare characterUIDs?: string[];

  // List of NPC UIDs associated with the session
  @Column(DataType.ARRAY(DataType.STRING)) declare npcUIDs?: string[];

  // List of user UIDs participating in the session
  @Column(DataType.ARRAY(DataType.STRING)) declare userUIDs?: string[];

  // List of online user UIDs in the session
  @Column(DataType.ARRAY(DataType.STRING)) declare onlineUserUIDs?: string[];

  // The name of the campaign associated with the session
  @Column declare campaignName?: string;

  // The current status of the session
  @Column declare sessionStatus?: SessionStatus;

  // The size of the map used in the session
  @Column(DataType.JSON) declare mapSize?: { width: number, height: number };

  // The history of messages in the session
  @HasMany(() => HistoryMessage)
  declare history: HistoryMessage[];

  // The monsters in the session
  @HasMany(() => Monster)
  declare monsters: Monster[];

  // The turns of entities in the session
  @HasMany(() => EntityTurn)
  declare entityTurns: EntityTurn[];

  /**
   * Returns the list of monster unique identifiers in the session.
   * @returns An array of monster unique identifiers.
   */
  get monsterUIDs(): string[] {
    return this.monsters.map(it => it.id.toString());
  }

  /**
   * Returns the ID of the entity that is currently playing.
   * @returns A string representing the entity that is currently playing.
   */
  get currentEntityUID(): string {
    return this.sortedTurns[0].entityUID;
  }

  /**
   * Returns the sorted list of the turns.
   * @returns An array of EntityTurn, where the turn indexed 0 is the current turn.
   */
  get sortedTurns(): EntityTurn[] {
    return this.entityTurns.sort((a, b) => a.turnIndex - b.turnIndex);
  }
}
