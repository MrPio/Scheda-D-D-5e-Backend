import dotenv from 'dotenv';
dotenv.config();
// If not in production, load the development .env file
if ((process.env.NODE_ENV ?? 'prod') === 'dev') {
  console.warn('Development enviroment active ---> load .dev.env');
  dotenv.config({ path: '.dev.env' });
}

import WebSocket from 'ws';
import { pipe, Subject } from 'rxjs';
import * as https from 'https';
import * as fs from 'fs';
import { IncomingMessage } from 'webpack-dev-server';
import { RepositoryFactory } from '../repository/repository_factory';
import { initializeSequelize } from '../db/sequelize';
import { CachedToken } from '../model/cached_token';
import express, { Request as Req, Response as Res, json } from 'express';
import { Session } from '../model/session';

const serverOptions = {
  cert: fs.readFileSync('src/websocket_keys/server.cert'),
  key: fs.readFileSync('src/websocket_keys/server.key'),
};
const server = new https.Server(serverOptions);
const wss = new WebSocket.Server({ server });
const activeConnections: { [key: string]: WebSocket[] } = {};
const onMessageSubject = new Subject<{ ws: WebSocket, message: string, session: Session, userUID: string }>();
const onCloseSubject = new Subject<{ ws: WebSocket, session: Session, userUID: string }>();
const onOpenSubject = new Subject<{ ws: WebSocket, session: Session, userUID: string }>();
const sessionRepository = new RepositoryFactory().sessionRepository();

export interface IAugmentedRequest extends IncomingMessage {
  token?: string;
  decodedToken?: CachedToken;
  sessionId?: string;
}

/**
 * Start websocket server.
 * The url is expected to be formatted as `/sessions/{sessionId}`
 */
wss.on('connection', async (ws: WebSocket, req: IAugmentedRequest) => {
  // Call Middleware to check the validity of the connection request.
  // TODO: pipe() here

  const session = (await sessionRepository.getById(req.sessionId!))!;

  // Notify listners on this new websocket connection events.
  ws.on('message', (message: string) => onMessageSubject.next({
    ws: ws,
    message: message,
    session: session,
    userUID: req.decodedToken!.userUID,
  }));
  ws.on('close', () => onCloseSubject.next({
    ws: ws,
    session: session,
    userUID: req.decodedToken!.userUID,
  }));
  onOpenSubject.next({
    ws: ws,
    session: session,
    userUID: req.decodedToken!.userUID,
  });


  // Answer the client about the success of the operation
  ws.send(JSON.stringify({ message: `Welcome to session "${session.name}", ${req.decodedToken!.username}!`, userUID: req.decodedToken!.userUID }));
});


// Subscribe connection opened listener
onOpenSubject.subscribe(async ({ ws, session, userUID }) => {

  // Add userUID to session onlineUserUIDs list
  session.onlineUserUIDs ??= [];
  session.onlineUserUIDs?.push(userUID);
  await sessionRepository.update(session.id, { onlineUserUIDs: session.onlineUserUIDs });

  // Store the ws connection object
  if (activeConnections[session.id])
    activeConnections[session.id].push(ws);
  else activeConnections[session.id] = [ws];
});


// Subscribe message handling listener
onMessageSubject.subscribe(({ ws, message, session, userUID }) => {
  wss.clients.forEach(client => {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ message: message.toString() }));
    }
  });
});

// Subscribe connection closed listener
onCloseSubject.subscribe(async ({ ws, session, userUID }) => {

  // Remove the client userUID from the list of online users for the session.
  session.onlineUserUIDs = session.onlineUserUIDs?.filter(item => item !== userUID);
  await sessionRepository.update(session.id, { onlineUserUIDs: session.onlineUserUIDs });

  // Remove the ws connection object from the list of active connections
  activeConnections[session.id] = activeConnections[session.id].filter(it => it == ws);
});

const app = express();
app.use(json());
app.get('/', (req: Req, res: Res) => {
  res.send('Hello World!');
});

// Start websocket server
(async () => {
  // Initialize sequelize ORM. If in dev environment, clear the database and run the seeders.
  await initializeSequelize({
    force: (process.env.NODE_ENV ?? 'prod') === 'dev',
    seed: (process.env.NODE_ENV ?? 'prod') === 'dev',
  });
  server.listen(8080, () => console.log('Server WSS is running on port 8080'));
  app.listen(3000, () => console.log('Server API is running on port 3000'));
})();

