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

  wrongParameterType = (param: string, type?: string): ErrorProduct => new WrongParamTypeError(param, type);

  userNotInSession = (sessionId: string, userUID: string): ErrorProduct => new GenericClientError(`User "${userUID}" is not a player nor the master of session "${sessionId}"!`);

  userNotOnline = (sessionId: string, userUID: string): ErrorProduct => new GenericClientError(`User "${userUID}" is not online in "${sessionId}" at the moment!`);

  sessionNotInOngoingState = (sessionId: string): ErrorProduct => new GenericClientError(`Session "${sessionId}" is not in Ongoing state at the moment!`);

  websocketRequestAlreadyPending = (sessionId: string): ErrorProduct => new GenericClientError(`A websocket request is already pending for session "${sessionId}"!`);

  clientTimeout = (): ErrorProduct => new TimeoutError();

  clientDisconnected = (): ErrorProduct => new ClientDisconnected();

  sessionNotInCreatedState = (sessionId:string): ErrorProduct => new GenericClientError(`Session "${sessionId}" is not in Created state at the moment!`);

  sessionNotInPausedState = (sessionId:string): ErrorProduct => new GenericClientError(`Session "${sessionId}" is not in Paused state at the moment!`);

  sessionNotInStopState = (sessionId:string): ErrorProduct => new GenericClientError(`Session "${sessionId}" is not in Paused or Ongoing state at the moment!`);
  
  invalidMapSize = (): ErrorProduct => new GenericClientError('Map size is invalid. Width must be between 10 and 100, and height must be between 10 and 100!');

  entityDuplicated = (entityType:string): ErrorProduct => new GenericClientError(`There is a duplicate in the list ${entityType}!`);

  entityIsOnBattle = (entityType: string, entityUid:string): ErrorProduct => new GenericClientError(`The ${entityType} ${entityUid} is already in the battle!!`);

  invalidPositiveInteger = (value: string): ErrorProduct => new GenericClientError(`The ${value} must be a positive integer!`);

  invalidInteger = (value: string): ErrorProduct => new GenericClientError(`The ${value} must be an integer!`);

  invalidSpeed = (): ErrorProduct => new GenericClientError('Speed must be a positive number divisible by 1.5!');

  invalidSkill = (value: string[]): ErrorProduct => new GenericClientError(`Invalid skill. It must be one of the following values: ${value.join(', ')}!`);

  invalidSkillValue = (value: string): ErrorProduct => new GenericClientError(`The ${value} must be an integer between 1 and 30!`);

  invalidEffectImmunities = (): ErrorProduct => new GenericClientError('The effectImmunities must be a list of effects!');

  invalidEffect = (value: string, list: string[]): ErrorProduct => new GenericClientError(`Invalid effect in the list: ${value}. The effect must be one of the following values: ${list.join(', ')}!`);

  entityNotFound = (id: string): ErrorProduct => new GenericClientError(`The entity ${id} is not in the battle!`);

  noModification = (): ErrorProduct => new GenericClientError('You need to change at least one parameter.!');

  noNewSlot = (level: number): ErrorProduct => new GenericClientError(`The new value of level "${level}" slots exceeds your maximum number of slots for that level!`);

  notYourTurn = (id: string): ErrorProduct => new GenericClientError(`It's not the turn of ${id}!`);

  notYourTurnEnchantment = (): ErrorProduct => new GenericClientError('It is not your turn. You cannot cast an enchantment with a casting time other than reaction!');

  identicalId = (): ErrorProduct => new GenericClientError('The two ids are identical!');

  postponeTurn = (): ErrorProduct => new GenericClientError('The turn can only be postponed with those who have not yet taken it!');

  reactionNotActivable = (id: string): ErrorProduct => new GenericClientError(`The entity ${id} has already used its reaction!`);

  attackTypeInvalid = (): ErrorProduct => new GenericClientError('The attackType is invalid. It must be one of the following values: attack, damageEnchantment, savingThrowEnchantment, descriptiveEnchantment!');

  weaponNotInInventory = (id: string, weapon: string): ErrorProduct => new GenericClientError(`The entity ${id} does not possess the weapon ${weapon}!`);

  enchantmentNotInInventory = (id: string, enchantment: string): ErrorProduct => new GenericClientError(`The entity ${id} does not possess the enchantment ${enchantment}!`);

  invalidEnchantmentCategory = (enchantment: string, category: string): ErrorProduct => new GenericClientError(`The enchantment: ${enchantment} does not belong to the category of spells ${category}!`);

  invalidSlotLevel = (): ErrorProduct => new GenericClientError('Slot must be an integer from 1 to 9, inclusive!');

  invalidSlotCasting = (level: number, slotLevel: number): ErrorProduct => new GenericClientError(`You can't cast a level ${level} enchantment with a level ${slotLevel} slot!`);

  noSlotAvaible = (level: number): ErrorProduct => new GenericClientError(`You don't have a level ${level} slot available!`);
}

/**
 * The errors related to the 500 series status code.
 * These errors are thrown for errors on the server side.
 */
export class Error500Factory {
  genericError = (): ErrorProduct => new GenericServerError('Internal Server Error!');
}