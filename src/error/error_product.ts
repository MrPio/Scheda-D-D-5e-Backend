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
  ) { super(StatusCodes.NOT_FOUND, `id "${id}" not found for model "${className}"!`); }
}

export class AuthError extends ErrorProduct {
  constructor(message: string) { super(StatusCodes.UNAUTHORIZED, message); }
}

export class MissingMandatoryParamError extends ErrorProduct {
  constructor(param: string) { super(StatusCodes.BAD_REQUEST, `Missing mandatory parameter: "${param}"!`); }
}

export class WrongParamTypeError extends ErrorProduct {
  constructor(param: string, type: string) { super(StatusCodes.BAD_REQUEST, `Parameter "${param}" must be of type "${type}"!`); }
}

export class GenericClientError extends ErrorProduct {
  constructor(message: string) { super(StatusCodes.BAD_REQUEST, message); }
}

export class GenericServerError extends ErrorProduct {
  constructor(message: string) { super(StatusCodes.INTERNAL_SERVER_ERROR, message); }
}