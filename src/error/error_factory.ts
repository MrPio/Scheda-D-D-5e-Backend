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

  userNotInSession = (sessionId:string, userUID:string): WrongParamTypeError => new GenericClientError(`User "${userUID}" is not a player nor the master of session "${sessionId}"!`);

  userNotOnline = (sessionId:string, userUID:string): WrongParamTypeError => new GenericClientError(`User "${userUID}" is not online in "${sessionId}" at this moment!`);

  sessionNotInOngoingState = (sessionId:string): WrongParamTypeError => new GenericClientError(`Session "${sessionId}" is not in Ongoing state at the moment!`);

  sessionNotInCreatedState = (sessionId:string): WrongParamTypeError => new GenericClientError(`Session "${sessionId}" is not in Created state at the moment!`);

  sessionNotInPausedState = (sessionId:string): WrongParamTypeError => new GenericClientError(`Session "${sessionId}" is not in Paused state at the moment!`);

  sessionNotInStopState = (sessionId:string): WrongParamTypeError => new GenericClientError(`Session "${sessionId}" is not in Paused or Ongoing state at the moment!`);
  
  invalidMapSize = (): WrongParamTypeError => new GenericClientError('Map size is invalid. Width must be between 10 and 100, and height must be between 10 and 100!');

  entityDuplicated = (entityType:string): WrongParamTypeError => new GenericClientError(`There is a duplicate in the list ${entityType}!`);

  entityIsOnBattle = (entityType: string, entityUid:string): WrongParamTypeError => new GenericClientError(`The ${entityType} ${entityUid} is already in the battle!!`);

  invalidPositiveInteger = (value: string): WrongParamTypeError => new GenericClientError(`The ${value} must be a positive integer!`);

  invalidInteger = (value: string): WrongParamTypeError => new GenericClientError(`The ${value} must be an integer!`);

  invalidSpeed = (): WrongParamTypeError => new GenericClientError('Speed must be a positive number divisible by 1.5!');

  invalidSkillValue = (value: string): WrongParamTypeError => new GenericClientError(`The ${value} must be an integer between 1 and 30!`);

  invalidEffectImmunities = (): WrongParamTypeError => new GenericClientError('The effectImmunities must be a list of effects!');

  invalidEffect = (value: string, list: string[]): WrongParamTypeError => new GenericClientError(`Invalid effect in the list: ${value}. The effect must be one of the following values: ${list.join(', ')}!`);

  entityNotFound = (id: string): WrongParamTypeError => new GenericClientError(`The entity ${id} is not in the battle!`);

  noModification = (): WrongParamTypeError => new GenericClientError('You need to change at least one parameter.!');


}

/**
 * The errors related to the 500 series status code.
 * These errors are thrown for errors on the server side.
 */
export class Error500Factory {
  genericError = (): ErrorProduct => new GenericServerError('Internal Server Error!');
}