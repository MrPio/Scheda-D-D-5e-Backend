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

// Enum defining the various statuses a session can have
enum SessionStatus {
  created,
  ongoing,
  paused,
  ended
}

// Interface defining the attributes of a Session
interface SessionAttributes {
  uid: string;
  name: string; 
  masterUID: string;
  entityUIDs: string[];
  createTimestamp: Date;
  entityPositions: Map<string, [number, number]>;
  campaignName: string;
  currentEntityUID: string;
  sessionStatus: SessionStatus;
}

// Class definition extending Sequelize Model
class Session extends Model<SessionAttributes> implements SessionAttributes {
  public readonly uid!: string;
  public readonly name!: string;
  public readonly masterUID!: string;
  public entityUIDs!: string[];
  public createTimestamp!: Date;
  public entityPositions!: Map<string, [number, number]>;
  public readonly campaignName!: string;
  public currentEntityUID!: string;
  public sessionStatus!: SessionStatus;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initializing the Session model with the defined attributes and options
Session.init({
  uid: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  masterUID: {
    type: DataTypes.STRING,
    allowNull: false
  },
  entityUIDs: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false
  },
  createTimestamp: {
    type: DataTypes.DATE,
    allowNull: false
  },
  entityPositions: {
    type: DataTypes.JSON,
    allowNull: false
  },
  campaignName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  currentEntityUID: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sessionStatus:{
    type: DataTypes.ENUM,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Session',
  freezeTableName: true,
  timestamps: true
});

// Exporting the Session model for use in other parts of the application
export default Session;

// Syncing the Sequelize model with the database
sequelize.sync().then(() => {
  console.log('Session table created successfully!');
}).catch((error: any) => {
  console.error('Unable to create table : ', error);
});
