import { Model, Column, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Session } from './session';

export enum ActionType {
  attackAttempt = 'attackAttempt',
  attackDamage = 'attackDamage',
  movement = 'movement',
  chat = 'chat',
}

/**
 * session (0,N)<------>(1,1) history
 * 
 * A `HistoryMessage' is a message that is generated when a player moves and sent to all players in the session.
 */
@Table({
  tableName: 'history',
  timestamps: true,
})
export class HistoryMessage extends Model<HistoryMessage> {
  @Column declare msg: string;

  @Column declare actionType: ActionType;

  @ForeignKey(() => Session)
  @Column declare sessionId: number;

  @BelongsTo(() => Session)
  declare session: Session;
}