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

// Enum defining the various type a relationship can have
enum Relationship{
 Ally,
 Friend,
 Animal,
 Basic,
 Boss,
 Divinity,
 Familiar,
 Innkeeper,
 Master,
 Monster,
 Nemesis,
 Enemy,
 Patron
}

// Interface defining the attributes of a Npc
interface NpcAttributes extends EntityAttributes {
  class: string; 
  race: string;
  level: number;
  relationship: Relationship;
}

// Class definition extending Sequelize Model
class Npc extends Model<NpcAttributes> implements NpcAttributes {
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
  
  public readonly class!: string; 
  public readonly race!: string;
  public readonly level!: number;
  public readonly relationship!: Relationship;
}

// Initializing the Npc model with the defined attributes and options
Npc.init({
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
  class: {
    type: DataTypes.STRING,
    allowNull: false
  },
  race: {
    type: DataTypes.STRING,
    allowNull: false
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  relationship: {
    type: DataTypes.ENUM,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Npc',
  freezeTableName: true,
  timestamps: false
});

// Exporting the Npc model for use in other parts of the application
export default Npc;

// Syncing the Sequelize model with the database
sequelize.sync().then(() => {
  console.log('Npc table created successfully!');
}).catch((error: any) => {
  console.error('Unable to create table : ', error);
});
