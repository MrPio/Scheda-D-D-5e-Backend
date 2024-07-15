import { Model, Column, Table, DataType, BelongsTo, ForeignKey, HasMany } from 'sequelize-typescript';
import { Person } from './person';

@Table({
  tableName: 'houses',
  timestamps: true,
})
export class House extends Model<House> {
  @Column declare name: string;

  @HasMany(() => Person)
  declare persons: Person[];
}
