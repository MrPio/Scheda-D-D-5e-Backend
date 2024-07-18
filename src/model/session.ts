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

@Table({
  tableName: 'sessions',
  timestamps: true,
})
export class Session extends Model<Session> {
  @Column declare name: string;

  @Column declare masterUID: string;

  @Column(DataType.ARRAY(DataType.STRING)) declare characterUIDs?: string[];

  @Column(DataType.ARRAY(DataType.STRING)) declare npcUIDs?: string[];

  @Column(DataType.ARRAY(DataType.STRING)) declare monsterUIDs?: string[];

  @Column(DataType.ARRAY(DataType.STRING)) declare userUIDs?: string[];

  @Column(DataType.ARRAY(DataType.STRING)) declare connectedUserUIDs?: string[];

  @Column declare campaignName?: string;

  @Column declare currentEntityUID?: string;

  @Column declare sessionStatus?: SessionStatus;

  @Column(DataType.JSON) declare mapSize?: { width: number, height: number };

  @HasMany(() => HistoryMessage)
  declare history: HistoryMessage[];

  @HasMany(() => Monster)
  declare monsters: Monster[];

  @HasMany(() => EntityTurn)
  declare entityTurn: EntityTurn[];
}