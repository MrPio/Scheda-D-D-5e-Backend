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
  // The unique identifier of the entity
  @Column declare entityUID: string;

  // The turn index of the entity
  @Column declare turnIndex: number;

  // The X position of the entity
  @Column declare posX: number;

  // The Y position of the entity
  @Column declare posY: number;

  // The foreign key referencing the session
  @ForeignKey(() => Session)
  @Column declare sessionId: number;

  // The session to which the entity turn belongs
  @BelongsTo(() => Session)
  declare session: Session;
}
