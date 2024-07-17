import express, { Request as Req, Response as Res, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import * as fs from 'fs';
import { signInAndGetIdToken } from './request_token';
import { continueSession, createSession, deleteSession, diceRoll, endTurn, getHistory, getSessionInfo, getSessions, getTurn, pauseSession, postponeTurn, startSession, stopSession, updateHistory } from './controller/session_controller';
import { addEffect, addEntity, deleteEntity, enableReaction, getEntityInfo, getMonsterInfo, getSavingThrow, makeAttack, updateEntityInfo } from './controller/entity_controller';
import { initializeSequelize } from './db/sequelize';
import dotenv from 'dotenv';

dotenv.config();
const serviceAccount = JSON.parse(fs.readFileSync('src/firebase_configs/service_account_key.json', 'utf8'));

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
export const db = admin.firestore();

const getDocument = async (collection: string, documentId: string) => {
  try {
    const docRef = db.collection(collection).doc(documentId);
    const doc = await docRef.get();
    if (doc.exists) {
      console.log('Document data:', doc.data());
    } else {
      console.log('No such document!');
    }
  } catch (error) {
    console.error('Error getting document:', error);
  }
};

const app = express();


export interface RequestWithToken extends Req {
  requestTime?: number;
  token?: string;
  decoded_token?: DecodedIdToken;
}
const requestTime = (req: RequestWithToken, res: Res, next: NextFunction) => {
  req.requestTime = Date.now();
  next();
};

const checkHeader = function (req: RequestWithToken, res: Res, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    next();
  } else {
    // let err = new Error('ahi ahi no auth header');
    res.sendStatus(403);
  }
};

const checkToken = function (req: RequestWithToken, res: Res, next: NextFunction) {
  const bearerHeader = req.headers.authorization;
  if (typeof bearerHeader !== 'undefined') {
    const bearerToken = bearerHeader.split(' ')[1];
    req.token = bearerToken;
    next();
  } else {
    res.sendStatus(403);
  }
};

const verifyToken = async (req: RequestWithToken, res: Res, next: NextFunction) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(req.token!);
    console.log('Token is valid:', decodedToken);
    req.decoded_token = decodedToken;
    next();

  } catch (error) {
    console.error('Error verifying token:', error);
    res.sendStatus(403);
  }
};

// An example endpoint. It will only succeed if the token is valid.
app.get('/', requestTime, checkHeader, checkToken, verifyToken, (req: RequestWithToken, res: Res) => {
  res.send('Hello World!');
});

// This endpoint retrieves the user document associated with the UID 
// of the JWT token from the Firebase Firestore DB. 
app.get('/user', requestTime, checkHeader, checkToken, verifyToken, (req: RequestWithToken, res: Res) => {
  getDocument('users', req.decoded_token!.uid);
  res.send(req.decoded_token!.name);
});

// This endpoint retrieves a 1 hour JWT from Firebase Auth.
app.get('/token', requestTime, async (req: RequestWithToken, res: Res) => {
  const token = await signInAndGetIdToken('valeriomorelli50@gmail.com', 'aaaaaa');
  res.send(`Your JWT is ${token}`);
});

// =========================================================

app.get('/sessions', checkToken, verifyToken, (req: RequestWithToken, res: Res) => {
  getSessions(req, res);
});

app.post('/sessions', checkToken, verifyToken, (req: RequestWithToken, res: Res) => {
  createSession(req, res);
});

app.get('/sessions/:sessionId', checkToken, verifyToken, (req: RequestWithToken, res: Res) => {
  getSessionInfo(req, res);
});

app.delete('/sessions/:sessionId', checkToken, verifyToken, (req: RequestWithToken, res: Res) => {
  deleteSession(req, res);
});

app.patch('/sessions/:sessionId/start', checkToken, verifyToken, (req: RequestWithToken, res: Res) => {
  startSession(req, res);
});

app.patch('/sessions/:sessionId/pause', checkToken, verifyToken, (req: RequestWithToken, res: Res) => {
  pauseSession(req, res);
});

app.patch('/sessions/:sessionId/continue', checkToken, verifyToken, (req: RequestWithToken, res: Res) => {
  continueSession(req, res);
});

app.patch('/sessions/:sessionId/stop', checkToken, verifyToken, (req: RequestWithToken, res: Res) => {
  stopSession(req, res);
});

app.patch('/sessions/:sessionId/addEntity', checkToken, verifyToken, (req: RequestWithToken, res: Res) => {
  addEntity(req, res);
});

app.get('/sessions/:sessionId/monsters/:monsterId', checkToken, verifyToken, (req: RequestWithToken, res: Res) => {
  getMonsterInfo(req, res);
});

app.delete('/sessions/:sessionId/entity', checkToken, verifyToken, (req: RequestWithToken, res: Res) => {
  deleteEntity(req, res);
});

app.get('/diceRoll', checkToken, verifyToken, (req: RequestWithToken, res: Res) => {
  diceRoll(req, res);
});

app.get('/sessions/:sessionId/turn', checkToken, verifyToken, (req: RequestWithToken, res: Res) => {
  getTurn(req, res);
});

app.patch('/sessions/:sessionId/turn/postpone', checkToken, verifyToken, (req: RequestWithToken, res: Res) => {
  postponeTurn(req, res);
});

app.patch('/sessions/:sessionId/turn/end', checkToken, verifyToken, (req: RequestWithToken, res: Res) => {
  endTurn(req, res);
});

app.patch('/sessions/:sessionId/attack', checkToken, verifyToken, (req: RequestWithToken, res: Res) => {
  makeAttack(req, res);
});

app.get('/sessions/:sessionId/savingThrow', checkToken, verifyToken, (req: RequestWithToken, res: Res) => {
  getSavingThrow(req, res);
});

app.patch('/sessions/:sessionId/addEffect', checkToken, verifyToken, (req: RequestWithToken, res: Res) => {
  addEffect(req, res);
});

app.get('/sessions/:sessionId/:entityId', checkToken, verifyToken, (req: RequestWithToken, res: Res) => {
  getEntityInfo(req, res);
});

app.patch('/sessions/:sessionId/:entityId', checkToken, verifyToken, (req: RequestWithToken, res: Res) => {
  updateEntityInfo(req, res);
});

app.patch('/sessions/:sessionId/reaction', checkToken, verifyToken, (req: RequestWithToken, res: Res) => {
  enableReaction(req, res);
});

app.get('/sessions/:sessionId/history', checkToken, verifyToken, (req: RequestWithToken, res: Res) => {
  getHistory(req, res);
});

app.post('/sessions/:sessionId/history', checkToken, verifyToken, (req: RequestWithToken, res: Res) => {
  updateHistory(req, res);
});

(async () => {
  await initializeSequelize();
  app.listen(3000, () => {
    console.log('Servers is running on port 3000');
  });
})();
