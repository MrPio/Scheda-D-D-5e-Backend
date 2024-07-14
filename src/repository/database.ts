import { Sequelize } from 'sequelize';
import * as fs from 'fs';
import {} from '../model/session';

const dbConfig = JSON.parse(fs.readFileSync('src/repository/config.json', 'utf8'));
const env = process.env.NODE_ENV || 'development';
const sequelize = new Sequelize(dbConfig[env]);

export default sequelize;


