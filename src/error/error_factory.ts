import { Session, SessionStatus } from '../model/session';
import ErrorProduct, { AuthError, ClientDisconnected, GenericClientError, GenericServerError, InvalidNumber, InventoryAbscence, MissingMandatoryParamError, ModelNotFound, TimeoutError, WrongElementTypeError, WrongModelState, WrongParamTypeError, ModelNotFoundInSession, InvalidEnchantmentCategory, WrongTurn } from './error_product';
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

  wrongParameterType = (param: string, type?: string): ErrorProduct => new WrongParamTypeError(param, type);

  userNotInSession = (sessionId: string, userUID: string): ErrorProduct => new GenericClientError(`User "${userUID}" is not a player nor the master of session "${sessionId}"!`);

  userNotOnline = (sessionId: string, userUID: string): ErrorProduct => new GenericClientError(`User "${userUID}" is not online in "${sessionId}" at the moment!`);

  websocketRequestAlreadyPending = (sessionId: string): ErrorProduct => new GenericClientError(`A websocket request is already pending for session "${sessionId}"!`);

  clientTimeout = (): ErrorProduct => new TimeoutError();

  clientDisconnected = (): ErrorProduct => new ClientDisconnected();

  sessionInWrongState = (sessionName: string, status: SessionStatus[]): ErrorProduct => new WrongModelState('Session', sessionName, 'status', status.toString());

  invalidMapSize = (): ErrorProduct => new GenericClientError('Map size is invalid. Width must be between 10 and 100, and height must be between 10 and 100!');

  invalidNumber = (param: string, message: string): ErrorProduct => new InvalidNumber(param, message);

  invalidEnchantmentCategory = (enchantment: string, category: string): ErrorProduct => new InvalidEnchantmentCategory(enchantment, category);

  wrongElementTypeError = (value: string, element: string, list: string[]): ErrorProduct => new WrongElementTypeError(value, element, list);

  inventoryAbscence = (id: string, element: string, value: string): ErrorProduct => new InventoryAbscence(id, element, value);

  entityNotFoundInSession = (entity: string, session: string): ErrorProduct => new ModelNotFoundInSession(entity, session);

  notYourTurn = (id: string): ErrorProduct => new WrongTurn(id);

  noModification = (message: string): ErrorProduct => new GenericClientError(message);

  reactionNotActivable = (id: string): ErrorProduct => new GenericClientError(`The entity ${id} has already used its reaction! They need to wait for the next turn!`);

  notYourTurnEnchantment = (message: string): ErrorProduct => new GenericClientError(message);

  entityIsOnBattle = (message: string): ErrorProduct => new GenericClientError(message);

  invalidSlotCasting = (message: string): ErrorProduct => new GenericClientError(message);

  noSlotAvaible = (message: string): ErrorProduct => new GenericClientError(message);

  //noNewSlot = (message: string): ErrorProduct => new GenericClientError(message);
}

/**
 * The errors related to the 500 series status code.
 * These errors are thrown for errors on the server side.
 */
export class Error500Factory {
  genericError = (): ErrorProduct => new GenericServerError('Internal Server Error!');
}