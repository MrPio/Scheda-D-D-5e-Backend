import { Response } from 'express';

abstract class ErrorFactory {
  constructor(
    public statusCode: number,
  ) { }

  public setStatus(res: Response): void {
    res.status(this.statusCode).json({
      BAD_REQUEST: messageType
    });
  };
}