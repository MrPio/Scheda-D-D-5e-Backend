import { Response } from 'express';

export default abstract class ErrorProduct {
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

export class ModelNotFound extends ErrorProduct {
  constructor(
    public className: string,
    public id: string,
  ) { super(404, `id ${id} not found for model ${className}`); }
}