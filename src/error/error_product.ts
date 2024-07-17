import { Response } from 'express';
import * as fs from 'fs';
import path from 'path';

export default abstract class ErrorProduct {
  constructor(
    protected statusCode: number,
    protected message: string,
  ) { }

  public setStatus(res: Response, useGIF: boolean = false): void {
    res.status(this.statusCode);
    if (useGIF)
      this.setGIF(res);
    else
      res.json({ error: this.constructor.name, ...this });
  }

  private setGIF(res: Response): void {
    fs.readFile(path.join(__dirname, 'error.html'), 'utf8', (err, htmlContent) => {
      if (!err) {
        const replacedContent = htmlContent.replaceAll('$statusCode', this.statusCode.toString()).replaceAll('$message', this.message);
        res.setHeader('Content-Type', 'text/html');
        res.send(replacedContent);
        res.sendFile(path.join(__dirname, `/gif/${this.statusCode}.gif`));
      }
    });
  }
}

export class ModelNotFound extends ErrorProduct {
  constructor(
    public className: string,
    public id: string,
  ) { super(404, `id ${id} not found for model ${className}`); }
}

export class AuthError extends ErrorProduct {
  constructor(message: string) { super(403, message); }
}

export class GenericServerError extends ErrorProduct {
  constructor(message: string) { super(500, message); }
}