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

// Enum defining the various category an enchantment can have
enum Category {
  damage,
  savingThrow,
  descriptive
}

// Interface defining the attributes of an Enchantment
interface EnchantmentAttributes {
  name: string; 
  range: number;
  rangeType: string;
  isCharmer: boolean;
  isReaction: boolean;
  category: Category;
}

// Class definition extending Sequelize Model
class Enchantment extends Model<EnchantmentAttributes> implements EnchantmentAttributes {
    public readonly name!: string; 
    public readonly range!: number;
    public readonly rangeType!: string;
    public readonly isCharmer!: boolean;
    public readonly isReaction!: boolean;
    public readonly category!: Category;
}

// Initializing the Enchantment model with the defined attributes and options
Enchantment.init({
  name: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  range: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  rangeType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isCharmer: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  isReaction: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Enchantment',
  freezeTableName: true,
  timestamps: false
});

// Exporting the Enchantment model for use in other parts of the application
export default Enchantment;

// Syncing the Sequelize model with the database
sequelize.sync().then(() => {
  console.log('Enchantment table created successfully!');
}).catch((error: any) => {
  console.error('Unable to create table : ', error);
});
