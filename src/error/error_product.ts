import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export default abstract class ErrorProduct {
  constructor(
    protected statusCode: number,
    protected message: string,
  ) { }

  public setStatus(res: Response): void {
    res.status(this.statusCode);
    res.json({ error: this.constructor.name, ...this });
  }
}

export class ModelNotFound extends ErrorProduct {
  constructor(
    public className: string,
    public id: string,
  ) { super(StatusCodes.NOT_FOUND, `Id "${id}" not found for model "${className}"!`); }
}

export class AuthError extends ErrorProduct {
  constructor(message: string) { super(StatusCodes.UNAUTHORIZED, message); }
}

export class MissingMandatoryParamError extends ErrorProduct {
  constructor(param: string) { super(StatusCodes.BAD_REQUEST, `Missing mandatory parameter: "${param}"!`); }
}

export class WrongParamTypeError extends ErrorProduct {
  constructor(param: string, type?: string) { super(StatusCodes.BAD_REQUEST, `Parameter "${param}" ` + (type ? `must be of type "${type}"!` : 'is of wrong type!')); }
}

export class GenericClientError extends ErrorProduct {
  constructor(message: string) { super(StatusCodes.BAD_REQUEST, message); }
}

export class WrongModelState extends ErrorProduct {
  constructor(model:string, instance:string, param:string, expectedValue:string) { super(StatusCodes.BAD_REQUEST, `${model} "${instance}"'s ${param} is not "${expectedValue}"!`); }
}

export class TooManyRequests extends ErrorProduct {
  constructor(message: string) { super(StatusCodes.TOO_MANY_REQUESTS, message); }
}

export class TimeoutError extends ErrorProduct {
  constructor() { super(StatusCodes.REQUEST_TIMEOUT, 'The client took too much time to answer!'); }
}

export class ClientDisconnected extends ErrorProduct {
  constructor() { super(StatusCodes.BAD_REQUEST, 'The client disconnected!'); }
}

export class GenericServerError extends ErrorProduct {
  constructor(message: string) { super(StatusCodes.INTERNAL_SERVER_ERROR, message); }
}