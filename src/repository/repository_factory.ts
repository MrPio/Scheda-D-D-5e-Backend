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

/**
 * Factory for creating repository instances for various models.
 * Provides a unified way to obtain repositories for different data stores.
 */
export class RepositoryFactory {

  /**
   * Creates a repository for `Session` entities with Sequelize.
   * @returns A `SequelizeRepository` instance for `Session`.
   */
  sessionRepository = (): Repository<Session> => new SequelizeRepository(Session, [Monster, HistoryMessage, EntityTurn], 1);

  /**
   * Creates a repository for `Monster` entities with Sequelize.
   * @returns A `SequelizeRepository` instance for `Monster`.
   */
  monsterRepository = (): Repository<Monster> => new SequelizeRepository(Monster, [MonsterSkill, Session], 1);

  /**
   * Creates a repository for `EntityTurn` entities with Sequelize.
   * @returns A `SequelizeRepository` instance for `EntityTurn`.
   */
  entityTurnRepository = (): Repository<EntityTurn> => new SequelizeRepository(EntityTurn, [Session], 30);

  /**
   * Creates a repository for `MonsterSkill` entities with Sequelize.
   * @returns A `SequelizeRepository` instance for `MonsterSkill`.
   */
  monsterSkillRepository = (): Repository<MonsterSkill> => new SequelizeRepository(MonsterSkill, [Monster], 30);

  /**
   * Creates a repository for `HistoryMessage` entities with Sequelize.
   * @returns A `SequelizeRepository` instance for `HistoryMessage`.
   */
  historyRepository = (): Repository<HistoryMessage> => new SequelizeRepository(HistoryMessage, [Session], 60);

  /**
   * Creates a repository for `CachedToken` entities with Redis.
   * @returns A `RedisRepository` instance for `CachedToken`.
   */
  tokenRepository = (): Repository<CachedToken> => new RedisRepository('cached_token', 300);

  /**
   * Creates a repository for `Character` entities with Firestore.
   * @returns A `FirestoreRepository` instance for `Character`.
   */
  characterRepository = (): Repository<Character> => new FirestoreRepository('characters', Character.fromJSON, 60);

  /**
   * Creates a repository for `NPC` entities with Firestore.
   * @returns A `FirestoreRepository` instance for `NPC`.
   */
  npcRepository = (): Repository<NPC> => new FirestoreRepository('npcs', NPC.fromJSON, 60);

  /**
   * Creates a repository for `Enchantment` entities with Firestore.
   * @returns A `FirestoreRepository` instance for `Enchantment`.
   */
  enchantmentRepository = (): Repository<Enchantment> => new FirestoreRepository('enchantments', Enchantment.fromJSON, 3600 * 24 * 7);

  /**
   * Creates a repository for `User` entities with Firestore.
   * @returns A `FirestoreRepository` instance for `User`.
   */
  userRepository = (): Repository<User> => new FirestoreRepository('users', User.fromJSON, 60);
}
