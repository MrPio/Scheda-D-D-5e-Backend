import { Sequelize } from 'sequelize-typescript';
import { Session, SessionStatus } from '../model/session';
import { EntityTurn } from '../model/entity_turn';

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
sequelize.addModels([Session, EntityTurn]);
export default sequelize;

(async () => {
  await sequelize.sync({ force: true });
  const session = await Session.create({ name: 'Session1', sessionStatus: SessionStatus.ongoing } as Session);
  await EntityTurn.create({ entityUID: '111', posX: 1, posY: 4, sessionId: session.id } as EntityTurn);

  const turn = await EntityTurn.findOne({ where: { entityUID: '111' }, include: [Session] });
  console.log(turn?.session.sessionStatus == SessionStatus.ongoing);
})();

