import express, { Request as Req, Response as Res, NextFunction, json } from 'express';
import { signInAndGetIdToken } from './db/auth';
import { continueSession, createSession, deleteSession, diceRoll, endTurn, getHistory, getSessionInfo, getSessions, getTurn, pauseSession, postponeTurn, startSession, stopSession, updateHistory } from './controller/session_controller';
import { addEffect, addEntity, deleteEntity, enableReaction, getEntityInfo, getSavingThrow, makeAttack, updateEntityInfo } from './controller/entity_controller';
import { initializeSequelize } from './db/sequelize';
import dotenv from 'dotenv';
import { CachedToken } from './model/cached_token';
import { checkHasToken, checkTokenIsValid } from './middleware/jwt_middleware';
import { checkDiceRoll } from './middleware/dice_middleware';
import { Error400Factory } from './error/error_factory';

dotenv.config();

// If not in production, load the development .env file
if ((process.env.NODE_ENV ?? 'prod') === 'dev') {
  console.warn('Development enviroment active ---> load .dev.env');
  dotenv.config({ path: '.dev.env' });
}

const app = express();

export interface AugmentedRequest extends Req {
  requestTime?: number;
  token?: string;
  decoded_token?: CachedToken;
}
const requestTime = (req: AugmentedRequest, res: Res, next: NextFunction) => {
  req.requestTime = Date.now();
  next();
};

function checkMandadoryParams(mandatoryParams: string[]) {
  return (req: AugmentedRequest, res: Res, next: NextFunction) => {
    for (const param of mandatoryParams)
      if (!(param in req.body))
        return new Error400Factory().missingMandatoryParam(param).setStatus(res);
    next();
  };
}

app.use(json());
app.use(requestTime);

// Test Routes =================================================================================
// An Hello World endpoint. It will succeed if the provided JWT is valid.
app.get('/', checkHasToken, checkTokenIsValid, (req: AugmentedRequest, res: Res) => {
  res.send('Hello World!');
});
// Retrieves a 1 hour JWT from Firebase Auth. This is an endpoint used for testing.
app.get('/token', async (req: AugmentedRequest, res: Res) => {
  const token = await signInAndGetIdToken({
    email: process.env.FIREBASE_AUTH_TEST_EMAIL ?? '',
    password: process.env.FIREBASE_AUTH_TEST_PASSWORD ?? '',
  });
  res.send(`Your JWT is ${token}`);
});


// Session Routes ==============================================================================
app.get('/sessions', checkHasToken, checkTokenIsValid, (req: AugmentedRequest, res: Res) => {
  getSessions(req, res);
});
app.post('/sessions', checkHasToken, checkTokenIsValid, (req: AugmentedRequest, res: Res) => {
  createSession(req, res);
});
app.get('/sessions/:sessionId', checkHasToken, checkTokenIsValid, (req: AugmentedRequest, res: Res) => {
  getSessionInfo(req, res);
});
app.delete('/sessions/:sessionId', checkHasToken, checkTokenIsValid, (req: AugmentedRequest, res: Res) => {
  deleteSession(req, res);
});
app.patch('/sessions/:sessionId/start', checkHasToken, checkTokenIsValid, (req: AugmentedRequest, res: Res) => {
  startSession(req, res);
});
app.patch('/sessions/:sessionId/pause', checkHasToken, checkTokenIsValid, (req: AugmentedRequest, res: Res) => {
  pauseSession(req, res);
});
app.patch('/sessions/:sessionId/continue', checkHasToken, checkTokenIsValid, (req: AugmentedRequest, res: Res) => {
  continueSession(req, res);
});
app.patch('/sessions/:sessionId/stop', checkHasToken, checkTokenIsValid, (req: AugmentedRequest, res: Res) => {
  stopSession(req, res);
});

// Turn Routes =================================================================================
app.get('/sessions/:sessionId/turn', checkHasToken, checkTokenIsValid, (req: AugmentedRequest, res: Res) => {
  getTurn(req, res);
});
app.patch('/sessions/:sessionId/turn/postpone', checkHasToken, checkTokenIsValid, (req: AugmentedRequest, res: Res) => {
  postponeTurn(req, res);
});
app.patch('/sessions/:sessionId/turn/end', checkHasToken, checkTokenIsValid, (req: AugmentedRequest, res: Res) => {
  endTurn(req, res);
});



// Attack Routes ===============================================================================
app.get('/diceRoll', checkMandadoryParams(['diceList']), checkDiceRoll, (req: AugmentedRequest, res: Res) => {
  diceRoll(req, res);
});
app.patch('/sessions/:sessionId/attack', checkHasToken, checkTokenIsValid, (req: AugmentedRequest, res: Res) => {
  makeAttack(req, res);
});
app.get('/sessions/:sessionId/savingThrow', checkHasToken, checkTokenIsValid, (req: AugmentedRequest, res: Res) => {
  getSavingThrow(req, res);
});
app.patch('/sessions/:sessionId/effect', checkHasToken, checkTokenIsValid, (req: AugmentedRequest, res: Res) => {
  addEffect(req, res);
});
app.patch('/sessions/:sessionId/reaction', checkHasToken, checkTokenIsValid, (req: AugmentedRequest, res: Res) => {
  enableReaction(req, res);
});


// Entity Routes ===============================================================================
app.patch('/sessions/:sessionId/entities', checkHasToken, checkTokenIsValid, (req: AugmentedRequest, res: Res) => {
  addEntity(req, res);
});
// app.get('/sessions/:sessionId/monsters/:monsterId', checkHasToken, checkTokenIsValid, (req: RequestWithToken, res: Res) => {
// getMonsterInfo(req, res);
// });
app.delete('/sessions/:sessionId/entities/:entityId', checkHasToken, checkTokenIsValid, (req: AugmentedRequest, res: Res) => {
  deleteEntity(req, res);
});
app.get('/sessions/:sessionId/entities/:entityId', checkHasToken, checkTokenIsValid, (req: AugmentedRequest, res: Res) => {
  getEntityInfo(req, res);
});
app.patch('/sessions/:sessionId/entities/:entityId', checkHasToken, checkTokenIsValid, (req: AugmentedRequest, res: Res) => {
  updateEntityInfo(req, res);
});

// History Routes ==============================================================================
app.get('/sessions/:sessionId/history', checkHasToken, checkTokenIsValid, (req: AugmentedRequest, res: Res) => {
  getHistory(req, res);
});
app.post('/sessions/:sessionId/history', checkHasToken, checkTokenIsValid, (req: AugmentedRequest, res: Res) => {
  updateHistory(req, res);
});

// Starts the express server
(async () => {
  await initializeSequelize();
  app.listen(3000, () => {
    console.log('Servers is running on port 3000');
  });
})();
