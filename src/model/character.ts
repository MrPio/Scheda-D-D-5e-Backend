import { DataTypes, Model } from 'sequelize';
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

interface CharacterAttributes extends EntityAttributes {
  deathRolls: [string, number];
  subskills: Map<string, number>;
  slots: Map<number, number>;
  class: string;
  race: string;
}

// Class definition extending Sequelize Model
class Character extends Model<CharacterAttributes> implements CharacterAttributes {
  public readonly uid!: string;

  public readonly userUID!: string;

  public readonly name!: string;

  public maxHp!: number;

  public hp!: number;

  public ac!: number;

  public readonly enchantments: string[] = [];

  public isReactionActivable!: boolean;

  public speed!: number;

  public readonly skills!: Map<string, number>;

  public readonly weapons!: string[];

  public effect!: Effect;

  public deathRolls!: [string, number];

  public readonly subskills!: Map<string, number>;

  public slots!: Map<number, number>;

  public readonly class!: string;

  public readonly race!: string;

}

Character.init({
  uid: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  userUID: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  maxHp: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  hp: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  ac: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  enchantments: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  isReactionActivable: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  speed: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },
  skills: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  weapons: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
  },
  effect: {
    type: DataTypes.ENUM,
    allowNull: false,
  },
  deathRolls: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  subskills: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  slots: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  class: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  race: {
    type: DataTypes.STRING,
    allowNull: false,
  },

}, {
  sequelize,
  modelName: 'Character',
  freezeTableName: true,
  timestamps: false,
});

export default Character;

sequelize.sync().then(() => {
  console.log('Character table created successfully!');
}).catch((error: Error) => {
  console.error('Unable to create table : ', error);
});
