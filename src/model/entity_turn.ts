import { Model, Column, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Session } from './session';

/**
 * Represents an entity's turn in a session.
 * This model captures information about the entity's position and turn index.
 */

@Table({
  tableName: 'entity_turns',
  timestamps: true,
})
export class EntityTurn extends Model<EntityTurn> {
  @Column declare entityUID: string;

  @Column declare turnIndex: number;

  @Column declare posX: number;

  @Column declare posY: number;

  @ForeignKey(() => Session)
  @Column declare sessionId: number;

  @BelongsTo(() => Session)
  declare session: Session;
}