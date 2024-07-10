import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../repository/database';

interface UserAttributes {
  id: number;
  username: string;
  email: string;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

// Class definition extending Sequelize Model
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public email!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: true
});

export default User;
