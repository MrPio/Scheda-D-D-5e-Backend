import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

/**
 * Abstract base class for error responses.
 * This class provides a mechanism for setting HTTP status codes 
 * and sending JSON responses with error details.
 */
export default abstract class ErrorProduct {
  constructor(
    protected statusCode: number,
    protected message: string,
  ) { }

  /**
   * Sets the HTTP status code and sends a JSON response with the error details.
   * @param res - Express response object
   */
  public setStatus(res: Response): void {
    res.status(this.statusCode);
    res.json({ error: this.constructor.name, ...this });
  }
}

// Error class for cases where a model with the specified ID is not found.
export class ModelNotFound extends ErrorProduct {
  constructor(
    public className: string,
    public id: string,
  ) { super(StatusCodes.NOT_FOUND, `Id "${id}" not found for model "${className}"!`); }
}

// Error class for cases where a model with the specified ID is not found in the session.
export class EntityNotFoundInSession extends ErrorProduct {
  constructor(
    public entity: string,
    public session: string,
  ) { super(StatusCodes.NOT_FOUND, `The entity "${entity}" is not in the session "${session}"!`); }
}

// Error class for unauthorized access attempts.
export class AuthError extends ErrorProduct {
  constructor(message: string) { super(StatusCodes.UNAUTHORIZED, message); }
}

// Error class for missing mandatory parameters in requests.
export class MissingMandatoryParamError extends ErrorProduct {
  constructor(param: string) { super(StatusCodes.BAD_REQUEST, `Missing mandatory parameter: "${param}"!`); }
}

// Error class for cases where a parameter is of the wrong type.
export class WrongParamTypeError extends ErrorProduct {
  constructor(param: string, type?: string) { super(StatusCodes.BAD_REQUEST, `Parameter "${param}" ` + (type ? `must be of type "${type}"!` : 'is of wrong type!')); }
}

// Error class for cases where a element of a list is of the wrong type.
export class WrongElementTypeError extends ErrorProduct {
  constructor(value: string, element: string, list: string[]) { super(StatusCodes.BAD_REQUEST, `The ${value}:"${element}" is invalid. It must be one of the following values: "${list.join(', ')}"!`); }
}

// Error class for cases where a number does not respect certain parameters
export class InvalidNumber extends ErrorProduct {
  constructor(param: string, message: string) { super(StatusCodes.BAD_REQUEST, `The "${param}" must be "${message}"!`); }
}

// Generic error class for client-side errors that don't fall into other specific categories.
export class GenericClientError extends ErrorProduct {
  constructor(message: string) { super(StatusCodes.BAD_REQUEST, message); }
}

// Error class for cases where a weapon or an enchantment is not found in the entity's inventory
export class InventoryAbscence extends ErrorProduct {
  constructor(id: string, element: string, value: string) { super(StatusCodes.BAD_REQUEST, `The entity "${id}" does not possess the ${element}:"${value}"!`); }
}

// Error class for cases where an enchantment with an inappropriate enchantment category is cast
export class InvalidEnchantmentCategory extends ErrorProduct {
  constructor(enchantment: string, category: string) { super(StatusCodes.BAD_REQUEST, `The enchantment: "${enchantment}" does not belong to the category of spells "${category}"!`); }
}

// Error class for cases where an entity tries to carry out an action but it is not its turn 
export class WrongTurn extends ErrorProduct {
  constructor(id:string) { super(StatusCodes.BAD_REQUEST, `It's not the turn of "${id}"!`); }
}

// Error class for cases where the status of a session is not compliant 
export class WrongModelState extends ErrorProduct {
  constructor(model:string, instance:string, param:string, expectedValue:string) { super(StatusCodes.BAD_REQUEST, `${model} "${instance}"'s ${param} is not "${expectedValue}"!`); }
}

// Error class for too many requests
export class TooManyRequests extends ErrorProduct {
  constructor(message: string) { super(StatusCodes.TOO_MANY_REQUESTS, message); }
}

// Error class for request timeouts when the client takes too long to respond.
export class TimeoutError extends ErrorProduct {
  constructor() { super(StatusCodes.REQUEST_TIMEOUT, 'The client took too much time to answer!'); }
}

// Error class for cases where the client disconnects unexpectedly.
export class ClientDisconnected extends ErrorProduct {
  constructor() { super(StatusCodes.BAD_REQUEST, 'The client disconnected!'); }
}

// Error class for generic server-side errors.
export class GenericServerError extends ErrorProduct {
  constructor(message: string) { super(StatusCodes.INTERNAL_SERVER_ERROR, message); }
}