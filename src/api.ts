import dotenv from 'dotenv';
dotenv.config();
// If not in production, load the development .env file
if ((process.env.NODE_ENV ?? 'prod') === 'dev') {
  console.warn('Development enviroment active ---> load .dev.env');
  dotenv.config({ path: '.dev.env' });
}

import express, { Response, NextFunction, json } from 'express';
import { signInAndGetIdToken } from './db/auth';
import { continueSession, createSession, deleteSession, diceRoll, endTurn, getHistory, getSessionInfo, getSessions, getTurn, pauseSession, postponeTurn, startSession, stopSession, updateHistory } from './controller/session_controller';
import { addEffect, addEntity, deleteEntity, enableReaction, getEntityInfo, getSavingThrow, makeAttack, updateEntityInfo } from './controller/entity_controller';
import { initializeSequelize } from './db/sequelize';
import { checkHasToken, checkTokenIsValid } from './middleware/jwt_middleware';
import { checkDiceRoll } from './middleware/dice_middleware';
import { IAugmentedRequest } from './interface/augmented_request';
import { checkMandadoryParams } from './middleware/mandatory_parameters';

const requestTime = (req: IAugmentedRequest, res: Response, next: NextFunction) => {
  req.requestTime = Date.now();
  next();
};

const app = express();
app.use(json());
app.use(requestTime);

// Test Routes =================================================================================
// An Hello World endpoint. It will succeed if the provided JWT is valid.
app.get('/', checkHasToken, checkTokenIsValid, (req: IAugmentedRequest, res: Response) => {
  res.send('Hello World!');
});
// Retrieves a 1 hour JWT from Firebase Auth. This is an endpoint used for testing.
app.get('/token', async (req: IAugmentedRequest, res: Response) => {
  const token = await signInAndGetIdToken({
    email: process.env.FIREBASE_AUTH_TEST_EMAIL ?? '',
    password: process.env.FIREBASE_AUTH_TEST_PASSWORD ?? '',
  });
  res.send(`Your JWT is ${token}`);
});


// Session Routes ==============================================================================
app.get('/sessions', checkHasToken, checkTokenIsValid, (req: IAugmentedRequest, res: Response) => {
  getSessions(req, res);
});
app.post('/sessions', checkHasToken, checkTokenIsValid, (req: IAugmentedRequest, res: Response) => {
  createSession(req, res);
});
app.get('/sessions/:sessionId', checkHasToken, checkTokenIsValid, (req: IAugmentedRequest, res: Response) => {
  getSessionInfo(req, res);
});
app.delete('/sessions/:sessionId', checkHasToken, checkTokenIsValid, (req: IAugmentedRequest, res: Response) => {
  deleteSession(req, res);
});
app.patch('/sessions/:sessionId/start', checkHasToken, checkTokenIsValid, (req: IAugmentedRequest, res: Response) => {
  startSession(req, res);
});
app.patch('/sessions/:sessionId/pause', checkHasToken, checkTokenIsValid, (req: IAugmentedRequest, res: Response) => {
  pauseSession(req, res);
});
app.patch('/sessions/:sessionId/continue', checkHasToken, checkTokenIsValid, (req: IAugmentedRequest, res: Response) => {
  continueSession(req, res);
});
app.patch('/sessions/:sessionId/stop', checkHasToken, checkTokenIsValid, (req: IAugmentedRequest, res: Response) => {
  stopSession(req, res);
});

// Turn Routes =================================================================================
app.get('/sessions/:sessionId/turn', checkHasToken, checkTokenIsValid, (req: IAugmentedRequest, res: Response) => {
  getTurn(req, res);
});
app.patch('/sessions/:sessionId/turn/postpone', checkHasToken, checkTokenIsValid, (req: IAugmentedRequest, res: Response) => {
  postponeTurn(req, res);
});
app.patch('/sessions/:sessionId/turn/end', checkHasToken, checkTokenIsValid, (req: IAugmentedRequest, res: Response) => {
  endTurn(req, res);
});

// Attack Routes ===============================================================================
app.get('/diceRoll', checkMandadoryParams(['diceList']), checkDiceRoll, (req: IAugmentedRequest, res: Response) => {
  diceRoll(req, res);
});
app.patch('/sessions/:sessionId/attack', checkHasToken, checkTokenIsValid, (req: IAugmentedRequest, res: Response) => {
  makeAttack(req, res);
});
app.get('/sessions/:sessionId/savingThrow', checkHasToken, checkTokenIsValid, (req: IAugmentedRequest, res: Response) => {
  getSavingThrow(req, res);
});
app.patch('/sessions/:sessionId/effect', checkHasToken, checkTokenIsValid, (req: IAugmentedRequest, res: Response) => {
  addEffect(req, res);
});
app.patch('/sessions/:sessionId/reaction', checkHasToken, checkTokenIsValid, (req: IAugmentedRequest, res: Response) => {
  enableReaction(req, res);
});

// Entity Routes ===============================================================================
app.patch('/sessions/:sessionId/entities', checkHasToken, checkTokenIsValid, (req: IAugmentedRequest, res: Response) => {
  addEntity(req, res);
});
// app.get('/sessions/:sessionId/monsters/:monsterId', checkHasToken, checkTokenIsValid, (req: RequestWithToken, res: Response) => {
// getMonsterInfo(req, res);
// });
app.delete('/sessions/:sessionId/entities/:entityId', checkHasToken, checkTokenIsValid, (req: IAugmentedRequest, res: Response) => {
  deleteEntity(req, res);
});
app.get('/sessions/:sessionId/entities/:entityId', checkHasToken, checkTokenIsValid, (req: IAugmentedRequest, res: Response) => {
  getEntityInfo(req, res);
});
app.patch('/sessions/:sessionId/entities/:entityId', checkHasToken, checkTokenIsValid, (req: IAugmentedRequest, res: Response) => {
  updateEntityInfo(req, res);
});

// History Routes ==============================================================================
app.get('/sessions/:sessionId/history', checkHasToken, checkTokenIsValid, (req: IAugmentedRequest, res: Response) => {
  getHistory(req, res);
});
app.post('/sessions/:sessionId/history', checkHasToken, checkTokenIsValid, (req: IAugmentedRequest, res: Response) => {
  updateHistory(req, res);
});

// Starts the express server
(async () => {
  // Initialize sequelize ORM. If in dev environment, clear the database and run the seeders.
  await initializeSequelize({
    force: (process.env.NODE_ENV ?? 'prod') === 'dev',
    seed: (process.env.NODE_ENV ?? 'prod') === 'dev',
  });
  app.listen(3000, () => console.log('Server API is running on port 3000'));
})();
