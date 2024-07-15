import { Model, Column, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Session } from './session';

@Table({
  tableName: 'entity_turns',
  timestamps: true,
})
export class EntityTurn extends Model<EntityTurn> {
  @Column declare entityUID: string;

  @Column declare posX: number;

  @Column declare posY: number;

  @ForeignKey(() => Session)
  @Column declare sessionId: number;

  @BelongsTo(() => Session)
  declare session: Session;
}
