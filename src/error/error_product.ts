import { Response } from 'express';

class ErrorProduct {
  constructor(
    public statusCode: number,
    public message: string,
  ) { }

  public setStatus(res: Response): void {
    res.status(this.statusCode).json({
      error: this.constructor.name, message: this.message,
    });
  }
}

console.log({ ...new ErrorProduct(200, "ciao")});