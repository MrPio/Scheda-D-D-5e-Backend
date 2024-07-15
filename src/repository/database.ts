// import { Sequelize } from 'sequelize';
// import * as fs from 'fs';
import { House } from '../model/house';
import { Person } from '../model/person';
import { } from '../model/session';

// const dbConfig = JSON.parse(fs.readFileSync('src/repository/config.json', 'utf8'));
// const env = process.env.NODE_ENV || 'development';
// const sequelize = new Sequelize(
//   'schedadnd5e',
//   'postgres',
//   'toor',
//   {
//     host: 'localhost',
//     port: 5432,
//     dialect: 'postgres',
//   },
// );

// TODO: make singleton

import { Sequelize } from 'sequelize-typescript';

const sequelize = new Sequelize({
  database: 'schedadnd5e',
  dialect: 'postgres',
  username: 'postgres',
  password: 'toor',
  port: 5432,
  host: 'localhost',
  // models: [__dirname + '/../model/**/*.ts'],
  // modelMatch: (filename, member) => {
  //   console.log(filename, member.toLowerCase());
  //   return filename === member.toLowerCase();
  // },
});
sequelize.addModels([Person, House]);
export default sequelize;


(async () => {
  await sequelize.sync({ force: true });
  const villa = await House.create({ name: 'Villa1' } as House);
  await Person.create({ name: 'John Doe', age: 30, houseId: villa.id } as Person);

  const person = await Person.findOne({ where: { name: 'John Doe' }, include: [House] });
  console.log(person?.houseId, person?.house);
})();

