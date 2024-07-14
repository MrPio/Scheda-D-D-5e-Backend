import { DataTypes, Model} from 'sequelize';
import { DbConnector } from '../db_connection';

/**
 * Connecting to the database using the Sequelize connection module.
 * The database connection is authenticated and the authentication result is managed.
 */
const sequelize = DbConnector.getConnection();
sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch((error: any) => {
    console.error('Unable to connect to the database: ', error);
});

// Interface defining the attributes of a User
interface UserAttributes {
  nickname: string; 
  email: string;
  regDateTimestamp: number;
  characterUIDs: string[];
  deletedCharacterUIDs: string[];
  sessionUIDs: string[];
}

// Class definition extending Sequelize Model
class User extends Model<UserAttributes> implements UserAttributes {
  public readonly nickname!: string; 
  public readonly email!: string;
  public regDateTimestamp!: number;
  public characterUIDs!: string[];
  public deletedCharacterUIDs!: string[];
  public sessionUIDs!: string[];
}

// Initializing the User model with the defined attributes and options
User.init({
  email: {
    type: DataTypes.DOUBLE,
    primaryKey: true,
    allowNull: false
  },
  nickname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  regDateTimestamp: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  characterUIDs: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false
  },
  deletedCharacterUIDs: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true
  },
  sessionUIDs: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'User',
  freezeTableName: true,
  timestamps: true
});

// Exporting the User model for use in other parts of the application
export default User;

// Syncing the Sequelize model with the database
sequelize.sync().then(() => {
  console.log('User table created successfully!');
}).catch((error: any) => {
  console.error('Unable to create table : ', error);
});
