import { Sequelize } from 'sequelize-typescript';
import { Session, SessionStatus } from '../model/session';
import { EntityTurn } from '../model/entity_turn';
import { Monster } from '../model/monster';
import { MonsterSkill } from '../model/monster_skill';
import { Effect } from '../model/effect';

// TODO singleton and .env

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
sequelize.addModels([Session, EntityTurn, Monster, MonsterSkill]);
export default sequelize;

(async () => {
  await sequelize.sync({ force: true });
  const session = await Session.create({ name: 'Session1', sessionStatus: SessionStatus.ongoing } as Session);
  await EntityTurn.create({ entityUID: '111', posX: 1, posY: 4, sessionId: session.id } as EntityTurn);

  await Monster.create({ name: 'Orco', hp: 10, maxHp: 100, effectImmunities: [Effect.blinded, Effect.charmed], sessionId: session.id } as Monster);

  const monster = await Monster.findOne({ where: { name: 'Orco' }, include: [Session] });
  if (monster?.effectImmunities)
    console.log(Effect[monster?.effectImmunities[0]]);
})();

