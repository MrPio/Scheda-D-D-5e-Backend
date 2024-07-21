import { Model, Column, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Session } from './session';

/**
 * Enum representing different types of actions that can be recorded in the history.
 */
export enum ActionType {
  attackAttempt = 'attackAttempt',
  attackDamage = 'attackDamage',
  movement = 'movement',
  chat = 'chat',
}
/**
 * Represents a message in the history of a session.
 * This message could represent various actions performed during the session such as attacks,
 * movements, or chat messages.
 * session (0,N)<------>(1,1) history
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