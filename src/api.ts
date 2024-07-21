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
import { ARRAY, checkMandadoryParams, checkParamsType, ENUM, NUMBER, OBJECT, STRING, BOOLEAN, OBJECT_ARRAY, NULLABLE, INTEGER, POS_INTEGER } from './middleware/parameters_middleware';
import { checkEntitiesExistsInSession, checkEntityExistsInSession, checkNewSession, checkSessionExists, checkSessionStatus } from './middleware/session_middleware';
import { checkEndTurn, checkPostponeTurn } from './middleware/turn_middleware';
import { checkAttackAttempt, checkRequestSavingThrow, checkEnableReaction } from './middleware/attack_middleware';
import { checkAddEntity } from './middleware/entity_middleware';
import { Dice } from './model/dice';
import { SessionStatus } from './model/session';
import { EntityType } from './model/entity';
import { Effect } from './model/effect';
import { ActionType } from './model/history_message';
import { Skill } from './model/monster_skill';
import { AttackType } from './model/attack_type';

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
app.get('/sessions',
  checkHasToken,
  checkTokenIsValid,
  (req: IAugmentedRequest, res: Response) => getSessions(req, res));

app.post('/sessions',
  checkHasToken,
  checkTokenIsValid,
  checkMandadoryParams(['name', 'masterUID', 'campaignName', 'mapSize']),
  checkParamsType({ name: STRING, masterUID: STRING, campaignName: STRING, mapSize: OBJECT({ 'width': POS_INTEGER, 'height': POS_INTEGER }) }),
  checkNewSession,
  (req: IAugmentedRequest, res: Response) => createSession(req, res));

app.get('/sessions/:sessionId',
  checkHasToken,
  checkTokenIsValid,
  checkSessionExists,
  (req: IAugmentedRequest, res: Response) => getSessionInfo(req, res));

app.delete('/sessions/:sessionId',
  checkHasToken,
  checkTokenIsValid,
  checkSessionExists,
  (req: IAugmentedRequest, res: Response) => deleteSession(req, res));

app.patch('/sessions/:sessionId/start',
  checkHasToken,
  checkTokenIsValid,
  checkSessionExists,
  checkSessionStatus([SessionStatus.created]),
  (req: IAugmentedRequest, res: Response) => startSession(req, res));

app.patch('/sessions/:sessionId/pause',
  checkHasToken,
  checkTokenIsValid,
  checkSessionExists,
  checkSessionStatus([SessionStatus.ongoing]),
  (req: IAugmentedRequest, res: Response) => pauseSession(req, res));

app.patch('/sessions/:sessionId/continue',
  checkHasToken,
  checkTokenIsValid,
  checkSessionExists,
  checkSessionStatus([SessionStatus.paused]),
  (req: IAugmentedRequest, res: Response) => continueSession(req, res));

app.patch('/sessions/:sessionId/stop',
  checkHasToken,
  checkTokenIsValid,
  checkSessionExists,
  checkSessionStatus([SessionStatus.paused, SessionStatus.ongoing]),
  (req: IAugmentedRequest, res: Response) => stopSession(req, res));

// Turn Routes =================================================================================
app.get('/sessions/:sessionId/turn',
  checkHasToken,
  checkTokenIsValid,
  checkSessionExists,
  (req: IAugmentedRequest, res: Response) => getTurn(req, res));

app.patch('/sessions/:sessionId/turn/postpone',
  checkHasToken,
  checkTokenIsValid,
  checkMandadoryParams(['entityId', 'predecessorEntityId']),
  checkParamsType({ entityId: STRING, predecessorEntityID: STRING }),
  checkSessionExists,
  checkEntityExistsInSession,
  checkPostponeTurn,
  (req: IAugmentedRequest, res: Response) => postponeTurn(req, res));

app.patch('/sessions/:sessionId/turn/end',
  checkHasToken,
  checkTokenIsValid,
  checkMandadoryParams(['entityId']),
  checkParamsType({ entityId: STRING }),
  checkSessionExists,
  checkEntityExistsInSession,
  checkEndTurn,
  (req: IAugmentedRequest, res: Response) => endTurn(req, res));

// Attack Routes ===============================================================================
app.get('/diceRoll',
  checkMandadoryParams(['diceList']),
  checkParamsType({ diceList: ARRAY(ENUM(Dice)), modifier: INTEGER }),
  checkDiceRoll,
  (req: IAugmentedRequest, res: Response) => diceRoll(req, res));

app.patch('/sessions/:sessionId/attack',
  checkHasToken,
  checkTokenIsValid,
  checkMandadoryParams(['entityId', 'attackType', 'attackInfo']),
  checkParamsType({
    entityId: STRING, attackType: ENUM(AttackType), attackInfo: OBJECT({
      'targetsId': ARRAY(STRING), 'weapon': STRING, 'attemptRoll': INTEGER,
      'enchantment': STRING, 'difficultyClass': POS_INTEGER, 'skill': ENUM(Skill), 'slotLevel': INTEGER,
    }),
  }),
  checkSessionExists,
  checkEntityExistsInSession,
  checkAttackAttempt,
  (req: IAugmentedRequest, res: Response) => makeAttack(req, res));

app.get('/sessions/:sessionId/savingThrow',
  checkHasToken,
  checkTokenIsValid,
  checkMandadoryParams(['entitiesId', 'difficultyClass', 'skill']),
  checkParamsType({ entitiesId: ARRAY(STRING), difficultyClass: POS_INTEGER, skill: ENUM(Skill) }),
  checkSessionExists,
  checkRequestSavingThrow,
  (req: IAugmentedRequest, res: Response) => getSavingThrow(req, res));

app.patch('/sessions/:sessionId/effect',
  checkHasToken,
  checkTokenIsValid,
  checkSessionExists,
  checkMandadoryParams(['entitiesId', 'effect']),
  checkParamsType({ entitiesId: ARRAY(STRING), effect: NULLABLE(ENUM(Effect)) }),
  (req: IAugmentedRequest, res: Response) => addEffect(req, res));

app.patch('/sessions/:sessionId/reaction',
  checkHasToken,
  checkTokenIsValid,
  checkMandadoryParams(['entitiesId']),
  checkParamsType({ entitiesId: ARRAY(STRING) }),
  checkSessionExists,
  checkEntitiesExistsInSession,
  checkEnableReaction,
  (req: IAugmentedRequest, res: Response) => enableReaction(req, res));

// Entity Routes ===============================================================================
app.patch('/sessions/:sessionId/entities',
  checkHasToken,
  checkTokenIsValid,
  checkMandadoryParams(['entityType', 'entityInfo']),
  checkParamsType({
    entityType: ENUM(EntityType), entityInfo: OBJECT({
      'authorUID': STRING,
      'name': STRING, 'hp': INTEGER, 'maxHp': POS_INTEGER, 'armorClass': POS_INTEGER,
      'isReactionActivable': BOOLEAN, 'speed': NUMBER, 'skills': OBJECT_ARRAY(ENUM(Skill), POS_INTEGER),
      'enchantments': ARRAY(STRING), 'weapons': ARRAY(STRING), 'effectImmunities': ARRAY(ENUM(Effect)),
      'effects': ARRAY(ENUM(Effect)), 'uid': STRING,
    }),
  }),
  checkSessionExists,
  checkAddEntity,
  (req: IAugmentedRequest, res: Response) => addEntity(req, res));

app.delete('/sessions/:sessionId/entities/:entityId',
  checkHasToken,
  checkTokenIsValid,
  checkSessionExists,
  checkEntityExistsInSession,
  (req: IAugmentedRequest, res: Response) => deleteEntity(req, res));

app.get('/sessions/:sessionId/entities/:entityId',
  checkHasToken,
  checkTokenIsValid,
  checkSessionExists,
  checkEntityExistsInSession,
  (req: IAugmentedRequest, res: Response) => getEntityInfo(req, res));

app.patch('/sessions/:sessionId/entities/:entityId',
  checkHasToken,
  checkTokenIsValid,
  checkMandadoryParams(['entityInfo']),
  checkParamsType({ entityInfo: OBJECT({ 'hp': INTEGER, 'armorClass': POS_INTEGER, 'speed': NUMBER, 'effects': ARRAY(ENUM(Effect)), 'slots': ARRAY(INTEGER) }) }),
  checkSessionExists,
  checkEntityExistsInSession,
  (req: IAugmentedRequest, res: Response) => updateEntityInfo(req, res));

// History Routes ==============================================================================
app.get('/sessions/:sessionId/history',
  checkHasToken,
  checkTokenIsValid,
  checkSessionExists,
  (req: IAugmentedRequest, res: Response) => getHistory(req, res));

app.post('/sessions/:sessionId/history',
  checkHasToken,
  checkTokenIsValid,
  checkMandadoryParams(['msg', 'actionType']),
  checkParamsType({ msg: STRING, actionType: ENUM(ActionType) }),
  checkSessionExists,
  (req: IAugmentedRequest, res: Response) => updateHistory(req, res));

// Starts the express server
(async () => {

  // Initialize sequelize ORM. If in dev environment, clear the database and run the seeders.
  await initializeSequelize({
    force: (process.env.NODE_ENV ?? 'prod') === 'dev',
    seed: (process.env.NODE_ENV ?? 'prod') === 'dev',
  });
  app.listen(3000, () => console.log('Server API is running on port 3000'));
})();
