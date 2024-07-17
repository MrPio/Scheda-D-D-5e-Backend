import { Model, Column, Table, HasMany, DataType } from 'sequelize-typescript';
import { EntityTurn } from './entity_turn';
import { Monster } from './monster';

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

  @Column declare entityUIDs?: string;

  @Column declare campaignName?: string;

  @Column declare currentEntityUID?: string;

  @Column declare sessionStatus?: SessionStatus;

  @Column(DataType.ARRAY(DataType.STRING)) declare history?: string[];

  @HasMany(() => Monster)
  declare monsters: Monster[];

  @HasMany(() => EntityTurn)
  declare entityTurn: EntityTurn[];
}