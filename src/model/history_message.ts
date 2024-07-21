import { Model, Column, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Session } from './session';


// Enum representing different types of actions that can be recorded in the history
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
  // The message content
  @Column declare msg: string;

  // The type of action the message represents
  @Column declare actionType: ActionType;

  // The foreign key referencing the session
  @ForeignKey(() => Session)
  @Column declare sessionId: number;

  // The session to which the history message belongs
  @BelongsTo(() => Session)
  declare session: Session;
}
