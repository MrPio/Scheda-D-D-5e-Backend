import { Request, Response, NextFunction } from 'express';
import { RepositoryFactory } from '../repository/repository_factory';
  
export const getHistory = async (req: Request, res: Response, next: NextFunction) => {
  
  const { sessionId } = req.params;
  const sessionID = String(sessionId);
  const session = await new RepositoryFactory().sessionRepository().getById( sessionID );
  if (!session) {
    return res.status(400).json({ error: 'Session not found' });
  }

  next();
};