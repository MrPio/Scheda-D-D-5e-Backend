import { Sequelize } from 'sequelize-typescript';
import { Session } from '../model/session';
import { EntityTurn } from '../model/entity_turn';
import { Monster } from '../model/monster';
import { MonsterSkill } from '../model/monster_skill';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  dialect: 'postgres',
  username: process.env.PG_USERNAME,
  password: process.env.PG_PASSWORD,
  port: +(process.env.PG_PORT ?? 5432),
  host: 'localhost',
  logging: false,
  // models: [__dirname + '/../model/**/*.ts'],
  // modelMatch: (filename, member) => {
  //   console.log(filename, member.toLowerCase());
  //   return filename === member.toLowerCase();
  // },
});
sequelize.addModels([Session, EntityTurn, Monster, MonsterSkill]);
export default sequelize;

export const initializeSequelize = async () => sequelize.sync({ force: true });