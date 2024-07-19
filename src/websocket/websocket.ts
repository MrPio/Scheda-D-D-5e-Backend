import dotenv from 'dotenv';
dotenv.config();
// If not in production, load the development .env file
if ((process.env.NODE_ENV ?? 'prod') === 'dev') {
  console.warn('Development enviroment active ---> load .dev.env');
  dotenv.config({ path: '.dev.env' });
}

import WebSocket from 'ws';
import { catchError, of, Subject, switchMap } from 'rxjs';
import * as https from 'https';
import * as fs from 'fs';
import { IncomingMessage } from 'webpack-dev-server';
import { RepositoryFactory } from '../repository/repository_factory';
import { initializeSequelize } from '../db/sequelize';
import { CachedToken } from '../model/cached_token';
import express, { Response, json } from 'express';
import { Session } from '../model/session';
import { checkJWT, checkSession, IConnectionFailError } from './middleware/websocket_middleware';
import { checkHasToken } from '../middleware/jwt_middleware';
import { checkIsAPIBackend, checkSessionExists, checkUserOnline } from './middleware/api_middleware';
import { generateJWT } from '../service/jwt_service';
import { IAugmentedRequest } from '../api';
import { Error500Factory } from '../error/error_factory';

const serverOptions = {
  cert: fs.readFileSync('src/websocket_keys/server.cert'),
  key: fs.readFileSync('src/websocket_keys/server.key'),
};
const server = new https.Server(serverOptions);
const wss = new WebSocket.Server({ server });
const activeConnections: { [sessionId: string]: { [userUID: string]: { webSocket: WebSocket, subject: Subject<{ message: string }> } } } = {};
const onOpenSubject = new Subject<{ ws: WebSocket, session: Session, userUID: string, username: string }>();
const onMessageSubject = new Subject<{ ws: WebSocket, message: string, session: Session, userUID: string }>();
const onCloseSubject = new Subject<{ ws: WebSocket, session: Session, userUID: string }>();
const sessionRepository = new RepositoryFactory().sessionRepository();
const error500Factory: Error500Factory = new Error500Factory();

export interface IAugmentedIncomingMessage extends IncomingMessage {
  token?: string;
  decodedToken?: CachedToken;
  sessionId?: string;
  userUID?: string;
}

/**
 * Start websocket server.
 * The url is expected to be formatted as `/sessions/{sessionId}`
 */
wss.on('connection', async (ws: WebSocket, req: IAugmentedIncomingMessage) => {

  /**
   * Call Middleware to check the validity of the connection request.
   * If all middleware is successful, the connection is saved.
   * `switchMap()` replaces the emitted `null` value with the `Promise` returned by middleware functions.
   */
  of(null).pipe(
    // Call the middleware
    switchMap(() => checkJWT(ws, req)),
    switchMap(() => checkSession(ws, req)),

    // If all of them succedeed, notify onOpenSubject observer
    switchMap(async () => {
      const session = (await sessionRepository.getById(req.sessionId!))!;
      onOpenSubject.next({ ws, session, userUID: req.decodedToken!.userUID, username: req.decodedToken!.username ?? 'User' });
      return of(null);
    }),

    // If any of the middleware failed
    catchError((error: IConnectionFailError) => {
      ws.close(error.statusCode, error.message);
      return of(null);
    }),
  ).subscribe();
});


// Subscribe connection opened listener
onOpenSubject.subscribe(async ({ ws, session, userUID, username }) => {

  // Answer the client about the success of the operation
  ws.send(JSON.stringify({ message: `Welcome to session "${session.name}", ${username}!`, userUID: userUID }));

  // Add userUID to session onlineUserUIDs list
  session.onlineUserUIDs ??= [];
  session.onlineUserUIDs?.push(userUID);
  await sessionRepository.update(session.id, { onlineUserUIDs: session.onlineUserUIDs });

  // Store the ws connection object
  if (!(session.id in activeConnections))
    activeConnections[session.id] = {};
  activeConnections[session.id][userUID] = { webSocket: ws, subject: new Subject<{ message: string }>() };

  // Notify listners on this new websocket connection events.
  ws.on('message', (message: string) => activeConnections[session.id][userUID].subject.next({ message }));
  ws.on('close', () => onCloseSubject.next({ ws, session, userUID }));
});

// Subscribe message handling listener
onMessageSubject.subscribe(({ ws, message }) => {
  wss.clients.forEach(client => {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ message: message.toString() }));
    }
  });
});

// Subscribe connection closed listener
onCloseSubject.subscribe(async ({ session, userUID }) => {

  // Remove the client userUID from the list of online users for the session.
  session.onlineUserUIDs = session.onlineUserUIDs?.filter(item => item !== userUID);
  await sessionRepository.update(session.id, { onlineUserUIDs: session.onlineUserUIDs });

  // Remove the ws connection object from the list of active connections
  delete activeConnections[session.id][userUID];
});

const app = express();
app.use(json());

// Test Routes =================================================================================
app.get('/', checkHasToken, checkIsAPIBackend, (req: IAugmentedRequest, res: Response) => {
  res.send('Hello World!');
});
// Retrieves a 15 min JWT representing the API backend. This is an endpoint used for testing since the API Backend generates the JWT by itself.
app.get('/token', (req: IAugmentedRequest, res: Response) => {
  res.json({ token: generateJWT() });
});

// Communication Routes ========================================================================
app.get('/sessions/:sessionId/users/:userUID/requestDiceRoll', checkHasToken, checkIsAPIBackend, checkSessionExists, checkUserOnline, (req: IAugmentedRequest, res: Response) => {
  // Check that the active connection stores the connection of interest
  if (!(req.sessionId! in activeConnections) || !(req.userUID! in activeConnections[req.sessionId!]))
    return error500Factory.genericError().setStatus(res);
  activeConnections[req.sessionId!][req.userUID!].webSocket.send(JSON.stringify({ message: 'Ciao!' }));

  activeConnections[req.sessionId!][req.userUID!].subject.subscribe(({ message }) => {
    res.json({ rollResult: Number.parseInt(message) });
    onMessageSubject.unsubscribe();
  });
});

// Start websocket and API servers
(async () => {
  // Initialize sequelize ORM. If in dev environment, clear the database and run the seeders.
  await initializeSequelize({
    force: (process.env.NODE_ENV ?? 'prod') === 'dev',
    seed: (process.env.NODE_ENV ?? 'prod') === 'dev',
  });
  server.listen(8080, () => console.log('Server WSS is running on port 8080'));
  app.listen(3000, () => console.log('Server API is running on port 3000'));
})();

