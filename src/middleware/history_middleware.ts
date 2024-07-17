import { Request, Response, NextFunction } from 'express';

function checkMessage(message: unknown): boolean {
  // Esempio di controllo del tipo di messaggio
  // Sostituisci questo con la tua logica di controllo del tipo
  return typeof message === 'string' && message.trim().length > 0;
}
  
export const validateMessage = (req: Request, res: Response, next: NextFunction) => {
  
  const { message } = req.query;
  
  // Check if the message is of the intended type
  if (!checkMessage(message)) {
    return res.status(400).json({ error: 'Invalid message type.' });
  }

  next();
};