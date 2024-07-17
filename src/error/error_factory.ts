import { Session } from '../model/session';
import ErrorProduct, { ModelNotFound } from './error_product';
import { Monster } from '../model/monster';
import NPC from '../model/npc';
import Character from '../model/character';
import Enchantment from '../model/enchantment';
import User from '../model/user';

export class Error400Factory {
  sessionNotFound = (id: string): ErrorProduct => new ModelNotFound(Session.name, id);

  monsterNotFound = (id: string): ErrorProduct => new ModelNotFound(Monster.name, id);

  characterNotFound = (id: string): ErrorProduct => new ModelNotFound(Character.name, id);

  npcNotFound = (id: string): ErrorProduct => new ModelNotFound(NPC.name, id);

  userNotFound = (id: string): ErrorProduct => new ModelNotFound(User.name, id);

  enchantmentNotFound = (id: string): ErrorProduct => new ModelNotFound(Enchantment.name, id);

  // diceNotFound = (id: string): ErrorProduct => new ModelNotFound('Dice', id);
}