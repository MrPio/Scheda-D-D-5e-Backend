import { Model, Column, Table, DataType, BelongsTo, ForeignKey, HasMany } from 'sequelize-typescript';
import { House } from './house';

@Table({
  tableName: 'persons',
  timestamps: true,
})
export class Person extends Model<Person> {
  @Column declare name: string;

  @Column declare age: number;

  @Column declare gender?: string;

  @ForeignKey(() => House)
  @Column declare houseId: number;

  @BelongsTo(() => House)
  declare house: House;
}