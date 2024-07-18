import { Repository } from './repository';
import { SequelizeRepository } from './sequelize_repository';
import { FirestoreRepository } from './firestore_repository';
import { Session } from '../model/session';
import { Monster } from '../model/monster';
import Character from '../model/character';
import NPC from '../model/npc';
import Enchantment from '../model/enchantment';
import User from '../model/user';
import { CachedToken } from '../model/cached_token';
import { RedisRepository } from './redis_repository';
import { HistoryMessage } from '../model/history_message';
import { MonsterSkill } from '../model/monster_skill';
import { EntityTurn } from '../model/entity_turn';

export class RepositoryFactory {
  sessionRepository = (): Repository<Session> => new SequelizeRepository(Session, [Monster, HistoryMessage, EntityTurn], 300);

  monsterRepository = (): Repository<Monster> => new SequelizeRepository(Monster, [MonsterSkill, Session], 300);

  entityTurnRepository = (): Repository<EntityTurn> => new SequelizeRepository(EntityTurn, [Session], 300);

  monsterSkillRepository = (): Repository<MonsterSkill> => new SequelizeRepository(MonsterSkill, [Monster], 300);

  historyRepository = (): Repository<HistoryMessage> => new SequelizeRepository(HistoryMessage, [Session], 300);

  tokenRepository = (): Repository<CachedToken> => new RedisRepository('cached_token', 300);

  characterRepository = (): Repository<Character> => new FirestoreRepository('characters', Character.fromJSON, 30);

  npcRepository = (): Repository<NPC> => new FirestoreRepository('npcs', NPC.fromJSON, 30);

  enchantmentRepository = (): Repository<Enchantment> => new FirestoreRepository('enchantments', Enchantment.fromJSON, 3600 * 24 * 7);

  userRepository = (): Repository<User> => new FirestoreRepository('users', User.fromJSON, 300);
}
