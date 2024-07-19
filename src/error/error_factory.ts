import { Session } from '../model/session';
import ErrorProduct, { AuthError, ClientDisconnected, GenericClientError, GenericServerError, MissingMandatoryParamError, ModelNotFound, TimeoutError, WrongParamTypeError } from './error_product';
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

  missingMandatoryParam = (param: string): ErrorProduct => new MissingMandatoryParamError(param);

  wrongParameterType = (param: string, type: string): ErrorProduct => new WrongParamTypeError(param, type);

  userNotInSession = (sessionId: string, userUID: string): ErrorProduct => new GenericClientError(`User "${userUID}" is not a player nor the master of session "${sessionId}"!`);

  userNotOnline = (sessionId: string, userUID: string): ErrorProduct => new GenericClientError(`User "${userUID}" is not online in "${sessionId}" at the moment!`);

  sessionNotInOngoingState = (sessionId: string): ErrorProduct => new GenericClientError(`Session "${sessionId}" is not in Ongoing state at the moment!`);

  websocketRequestAlreadyPending = (sessionId: string): ErrorProduct => new GenericClientError(`A websocket request is already pending for session "${sessionId}"!`);

  clientTimeout = (): ErrorProduct => new TimeoutError();

  clientDisconnected = (): ErrorProduct => new ClientDisconnected();
}

/**
 * The errors related to the 500 series status code.
 * These errors are thrown for errors on the server side.
 */
export class Error500Factory {
  genericError = (): ErrorProduct => new GenericServerError('Internal Server Error!');
}