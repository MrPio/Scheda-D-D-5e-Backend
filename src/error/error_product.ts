import { Response } from 'express';

abstract class ErrorProduct {
  constructor(
    public statusCode: number,
    public message: string,
  ) { }

  public setStatus(res: Response): void {
    res.status(this.statusCode).json({
      error: this.constructor.name, ...this,
    });
  }
}

class ModelNotFound extends ErrorProduct{
  constructor(
    public 
  )
}