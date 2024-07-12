import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../repository/database';

interface SessionAttributes {
  id: number;
  Sessionname: string;
  email: string;
}

interface SessionCreationAttributes extends Optional<SessionAttributes, 'id'> {}

// Class definition extending Sequelize Model
class Session extends Model<SessionAttributes, SessionCreationAttributes> implements SessionAttributes {
  public id!: number;
  public Sessionname!: string;
  public email!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Session.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  Sessionname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Session',
  tableName: 'Sessions',
  timestamps: true
});

export default Session;
