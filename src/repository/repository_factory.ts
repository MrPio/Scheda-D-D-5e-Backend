import { Repository } from './repository';
import { SequelizeRepository } from './sequelize_repository';
import { FirestoreRepository } from './firestore_repository';
import { Session } from '../model/session';
import { Monster } from '../model/monster';
import Character from '../model/character';
import NPC from '../model/npc';
import Enchantment from '../model/enchantment';
import User from '../model/user';

export class RepositoryFactory {
  sessionRepository = (): Repository<Session> => new SequelizeRepository(Session, 300);

  monsterRepository = (): Repository<Monster> => new SequelizeRepository(Monster, 300);

  characterRepository = (): Repository<Character> => new FirestoreRepository('characters', Character.fromJSON, 30);

  npcRepository = (): Repository<NPC> => new FirestoreRepository('npcs', NPC.fromJSON, 30);

  enchantmentRepository = (): Repository<Enchantment> => new FirestoreRepository('enchantments', Enchantment.fromJSON, 3600 * 24 * 7);

  userRepository = (): Repository<User> => new FirestoreRepository('users', User.fromJSON, 300);

}
