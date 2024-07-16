import { Request, Response, NextFunction } from 'express';

export const parameterCheckMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const { diceList } = req.query;

  // Check if diceList is provided
  if (!diceList) {
    return res.status(400).json({ error: 'diceList is a required parameter.' });
  }

  next();
};