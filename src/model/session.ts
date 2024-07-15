import { Model, Column, Table, HasMany } from 'sequelize-typescript';
import { EntityTurn } from './entity_turn';

// The different states that a session can be in during its life cycle.
export enum SessionStatus {
  created,
  ongoing,
  paused,
  ended,
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

  @HasMany(() => EntityTurn)
  declare entityTurn: EntityTurn[];
}