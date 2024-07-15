import { DataTypes, Model} from 'sequelize';
import { DbConnector } from '../db_connection';
import { Effect } from './effect'
import { EntityAttributes } from './entity'

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

// Interface defining the attributes of a Monster
interface MonsterAttributes extends EntityAttributes {
  effectImmunities: Effect[]; 
  sessionUID: string;
}

// Class definition extending Sequelize Model
class Monster extends Model<MonsterAttributes> implements MonsterAttributes {
  public readonly uid!: string;
 
  public readonly userUID!: string;

  public readonly name!: string;

  public maxHp!: number;

  public hp!: number;

  public ac!: number;

  public readonly enchantments!: string[];

  public isReactionActivable!: boolean;

  public speed!: number;

  public readonly skills!: Map<string, number>;

  public readonly weapons!: string[];

  public effect!: Effect;
  
  public readonly effectImmunities!: Effect[];
 
  public readonly sessionUID!: string;
}

// Initializing the Monster model with the defined attributes and options
Monster.init({
  uid: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  userUID: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  maxHp: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  hp: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ac: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  enchantments: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true
  },
  isReactionActivable: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  speed: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  skills: {
    type: DataTypes.JSON,
    allowNull: false
  },
  weapons:{
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false
  },
  effect: {
    type: DataTypes.ENUM,
    allowNull: false
  },
  effectImmunities: {
    type: DataTypes.ARRAY(DataTypes.ENUM),
    allowNull: true
  },
  sessionUID:{
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Monster',
  freezeTableName: true,
  timestamps: false
});

// Exporting the Monster model for use in other parts of the application
export default Monster;

// Syncing the Sequelize model with the database
sequelize.sync().then(() => {
  console.log('Monster table created successfully!');
}).catch((error: any) => {
  console.error('Unable to create table : ', error);
});
