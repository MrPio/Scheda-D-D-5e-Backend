import { DataTypes, Model } from 'sequelize';
import sequelize from '../repository/database';

/**
 * Connecting to the database using the Sequelize connection module.
 * The database connection is authenticated and the authentication result is managed.
 */
sequelize.authenticate().then(() => {
  console.log('Connection has been established successfully.');
}).catch((error: Error) => {
  console.error('Unable to connect to the database: ', error);
});

// Enum defining the various statuses a session can have
enum SessionStatus {
  created = 'created',
  ongoing = 'ongoing',
  paused = 'paused',
  ended = 'ended',
}

// Interface defining the attributes of a Session
interface SessionAttributes {
  uid: number;
  name: string;
  masterUID: string;
  entityUIDs: string[];
  entityPositions: number[][];
  campaignName: string;
  currentEntityUID: string | null;
  sessionStatus: SessionStatus;
}

// Class definition extending Sequelize Model
class Session extends Model<SessionAttributes> implements SessionAttributes {
  public readonly uid!: number;

  public readonly name!: string;

  public readonly masterUID!: string;

  public entityUIDs!: string[];

  public entityPositions!: number[][];

  public readonly campaignName!: string;

  public currentEntityUID: string | null = null;

  public sessionStatus!: SessionStatus;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;
}

// Initializing the Session model with the defined attributes and options
Session.init({
  uid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  masterUID: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  entityUIDs: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
  },
  entityPositions: {
    type: DataTypes.ARRAY(DataTypes.ARRAY(DataTypes.INTEGER)),
    allowNull: false,
  },
  campaignName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  currentEntityUID: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  sessionStatus: {
    type: DataTypes.ENUM(...Object.values(SessionStatus).map(value => value.toString())),
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Session',
  freezeTableName: true,
  timestamps: true,
});

// Exporting the Session model for use in other parts of the application
export default Session;

// Syncing the Sequelize model with the database
sequelize.sync().then(() => {
  console.log('Session table created successfully!');
}).catch((error: Error) => {
  console.error('Unable to create table : ', error);
});


// Session.create({
//   uid: 12,
//   name: 'SessioneDiProva1',
//   masterUID: 'k9vc0kojNcO9JB9qVdf33F6h3eD2',
//   entityUIDs: ['9BX6tZpRKP0jB2bQu0PA', 'EGUDW2EYaQhcPAheqUv0'],
//   entityPositions: [[1, 1], [2, 1]],
//   campaignName: 'PrimaCampagna',
//   currentEntityUID: null,
//   sessionStatus: SessionStatus.created,
// });