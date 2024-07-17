import { Model, Column, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Session } from './session';

export enum ActionType {
  attackAttempt = 'attackAttempt',
  attackDamage = 'attackDamage',
  movement = 'movement',
  chat = 'chat',
}

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