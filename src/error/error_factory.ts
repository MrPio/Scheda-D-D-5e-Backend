import { Session } from '../model/session';
import ErrorProduct, { AuthError, GenericClientError, GenericServerError, MissingMandatoryParamError, ModelNotFound, WrongParamTypeError } from './error_product';
import { Monster } from '../model/monster';
import NPC from '../model/npc';
import Character from '../model/character';
import Enchantment from '../model/enchantment';
import User from '../model/user';

/**
 * The errors related to the 400 series status code.
 * These errors are thrown for errors on the client side.
 */
export class Error400Factory {
  genericError = (message: string): ErrorProduct => new GenericClientError(message);

  sessionNotFound = (id: string): ErrorProduct => new ModelNotFound(Session.name, id);

  monsterNotFound = (id: string): ErrorProduct => new ModelNotFound(Monster.name, id);

  characterNotFound = (id: string): ErrorProduct => new ModelNotFound(Character.name, id);

  npcNotFound = (id: string): ErrorProduct => new ModelNotFound(NPC.name, id);

  userNotFound = (id: string): ErrorProduct => new ModelNotFound(User.name, id);

  enchantmentNotFound = (id: string): ErrorProduct => new ModelNotFound(Enchantment.name, id);

  diceNotFound = (id: string): ErrorProduct => new ModelNotFound('Dice', id);

  noJWT = (): ErrorProduct => new AuthError('No JWT provided!');

  invalidJWT = (): ErrorProduct => new AuthError('The JWT provided was not valid!');

  wrongFormatJWT = (): ErrorProduct => new AuthError('The JWT provided has an invalid format!');

  expiredJWT = (): ErrorProduct => new AuthError('The JWT provided has expired!');

  missingMandatoryParam = (param: string): MissingMandatoryParamError => new MissingMandatoryParamError(param);

  wrongParameterType = (param: string, type: string): WrongParamTypeError => new WrongParamTypeError(param, type);
}

/**
 * The errors related to the 500 series status code.
 * These errors are thrown for errors on the server side.
 */
export class Error500Factory {
  genericError = (): ErrorProduct => new GenericServerError('Internal Server Error!');
}