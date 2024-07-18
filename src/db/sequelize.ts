import { Sequelize } from 'sequelize-typescript';
import { Session, SessionStatus } from '../model/session';
import { EntityTurn } from '../model/entity_turn';
import { Monster } from '../model/monster';
import { MonsterSkill, Skill } from '../model/monster_skill';
import { HistoryMessage } from '../model/history_message';
import dotenv from 'dotenv';
import { RepositoryFactory } from '../repository/repository_factory';
import { Effect } from '../model/effect';

dotenv.config();
let synced: boolean = false;
const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  dialect: 'postgres',
  username: process.env.PG_USERNAME,
  password: process.env.PG_PASSWORD,
  port: +(process.env.PG_PORT ?? 5432),
  host: 'localhost',
  logging: false,
});
sequelize.addModels([Session, EntityTurn, Monster, MonsterSkill, HistoryMessage]);
export default sequelize;

export const initializeSequelize = async (options: { force?: boolean, seed?: boolean } = {}) => {
  if (synced) return;
  await sequelize.sync({ force: options.force ?? false });
  if (options.seed ?? false)
    await seedDatabase();
  synced = true;
};

/**
 * Seed database with sample data.
 * This seed creates a session, with one player as the master, and adds a monster to it.
 * This will add at least one row to each of the database tables.
 */
const seedDatabase = async () => {
  const sessionRepository = new RepositoryFactory().sessionRepository();
  const entityTurnRepository = new RepositoryFactory().entityTurnRepository();
  const monsterRepository = new RepositoryFactory().monsterRepository();
  const monsterSkillRepository = new RepositoryFactory().monsterSkillRepository();

  // Add a sample session
  const session = await sessionRepository.create({
    name: 'Session1',
    masterUID: 'k9vc0kojNcO9JB9qVdf33F6h3eD2',
    userUIDs: ['k9vc0kojNcO9JB9qVdf33F6h3eD2'],
    characterUIDs: ['EGUDW2EYaQhcPAheqUv0'],
    sessionStatus: SessionStatus.ongoing,
    mapSize: { width: 12, height: 10 },
    campaignName: 'Desert Adventure',
  } as Session);

  // Add a sample entity turn
  await entityTurnRepository.create({
    entityUID: 'EGUDW2EYaQhcPAheqUv0',
    posX: 1,
    posY: 3,
    turnIndex: 0,
    sessionId: session.id,
  } as EntityTurn);

  // Add a sample monster
  const monster = await monsterRepository.create({
    _name: 'Orodrik',
    authorUID: 'k9vc0kojNcO9JB9qVdf33F6h3eD2',
    _maxHp: 18,
    _hp: 12,
    armorClass: 16,
    enchantments: ['Allucinazione di forza', 'Paura', 'Invisibilità'],
    isReactionActivable: true,
    speed: 10.5,
    weapons: ['Morning Star'],
    effectImmunities: [Effect.blinded, Effect.paralyzed],
    sessionId: session.id,
  } as Monster);

  // Assign a value to each of the six skills for that monster.
  await monsterSkillRepository.create({
    skill: Skill.strength,
    value: 14,
    monsterId: monster.id,
  } as MonsterSkill);
  await monsterSkillRepository.create({
    skill: Skill.dexterity,
    value: 12,
    monsterId: monster.id,
  } as MonsterSkill);
  await monsterSkillRepository.create({
    skill: Skill.charisma,
    value: 5,
    monsterId: monster.id,
  } as MonsterSkill);
  await monsterSkillRepository.create({
    skill: Skill.constitution,
    value: 17,
    monsterId: monster.id,
  } as MonsterSkill);
  await monsterSkillRepository.create({
    skill: Skill.wisdom,
    value: 7,
    monsterId: monster.id,
  } as MonsterSkill);
  await monsterSkillRepository.create({
    skill: Skill.intelligence,
    value: 6,
    monsterId: monster.id,
  } as MonsterSkill);
};