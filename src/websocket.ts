import dotenv from 'dotenv';
dotenv.config();
// If not in production, load the development .env file
if ((process.env.NODE_ENV ?? 'prod') === 'dev') {
  console.warn('Development enviroment active ---> load .dev.env');
  dotenv.config({ path: '.dev.env' });
}

import WebSocket from 'ws';
import { Subject } from 'rxjs';
import * as https from 'https';
import * as fs from 'fs';
import { IncomingMessage } from 'webpack-dev-server';
import { decodeToken } from './db/auth';
import { RepositoryFactory } from './repository/repository_factory';
import { SessionStatus } from './model/session';
import { initializeSequelize } from './db/sequelize';
import { CachedToken } from './model/cached_token';
import express, { Request as Req, Response as Res, json } from 'express';

interface IMessageEvent {
  ws: WebSocket;
  message: string;
}

const serverOptions = {
  cert: fs.readFileSync('src/websocket_keys/server.cert'),
  key: fs.readFileSync('src/websocket_keys/server.key'),
};
const server = new https.Server(serverOptions);
const wss = new WebSocket.Server({ server });
const messageSubject = new Subject<IMessageEvent>();
const activeConnections: { [key: string]: WebSocket[] } = {};

/**
 *  Start websocket server. The url is expected to be formatted as `/sessions/{sessionId}`
 */
wss.on('connection', async (ws: WebSocket, req: IncomingMessage) => {
  const sessionRepository = new RepositoryFactory().sessionRepository();

  // Check if JWT authorization is disabled for testing purposes.
  let decodedToken;
  if ((process.env.USE_JWT ?? 'true') != 'true')
    decodedToken = new CachedToken('k9vc0kojNcO9JB9qVdf33F6h3eD2', 'debug_token', 0, 0, 'Developer');
  else {
    // Retrieve and decode JWT
    const authHeader = req.headers.authorization;
    if (typeof authHeader === 'undefined')
      return ws.close(1008, 'Token not found');
    try {
      decodedToken = await decodeToken(authHeader.split(' ')[1]);
    } catch (error) {
      return ws.close(1008, 'Invalid token');
    }
  }

  // Retrieve session
  const sessionId = req.url?.split('sessions/')[1];
  if (!sessionId)
    return ws.close(1008, 'Session id not provided');
  const session = await sessionRepository.getById(sessionId);
  if (!session)
    return ws.close(1008, 'Session not found');

  // Check if the user is in the session
  if (!session.userUIDs?.includes(decodedToken.userUID) && session.masterUID !== decodedToken.userUID)
    return ws.close(1008, `User "${decodedToken.username}" is not part of the session "${session.name}"`);

  // Check if the session is ongoing
  if (session.sessionStatus !== SessionStatus.ongoing)
    return ws.close(1008, `Session "${session.name}" is not in Ongoing state`);

  ws.on('message', (message: string) => messageSubject.next({ ws, message }));
  ws.on('close', async () => {
    session.onlineUserUIDs = session.onlineUserUIDs?.filter(item => item !== decodedToken.userUID);
    await sessionRepository.update(session.id, { onlineUserUIDs: session.onlineUserUIDs });

    // Remove the ws connection object from the list of active connections
    activeConnections[sessionId] = activeConnections[sessionId].filter(it => it == ws);
  });

  // Add userUID to session onlineUserUIDs list
  session.onlineUserUIDs ??= [];
  session.onlineUserUIDs?.push(decodedToken.userUID);
  await sessionRepository.update(session.id, { onlineUserUIDs: session.onlineUserUIDs });

  // Store the ws connection object
  if (activeConnections[sessionId])
    activeConnections[sessionId].push(ws);
  else activeConnections[sessionId] = [ws];

  // Answer the client about the success of the operation
  ws.send(JSON.stringify({ message: `Welcome to session "${session.name}", ${decodedToken.username}!`, userUID: decodedToken.userUID }));
});

// Subscribe message handling listener
messageSubject.subscribe(({ ws, message }) => {
  wss.clients.forEach(client => {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ message: message.toString() }));
    }
  });
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

