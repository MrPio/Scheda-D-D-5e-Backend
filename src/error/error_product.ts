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

// Generic error class for client-side errors that don't fall into other specific categories.
export class GenericClientError extends ErrorProduct {
  constructor(message: string) { super(StatusCodes.BAD_REQUEST, message); }
}

// Error class for cases where the client has made too many requests in a short period.
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