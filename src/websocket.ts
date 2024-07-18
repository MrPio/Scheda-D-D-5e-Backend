import WebSocket from 'ws';
import { Subject } from 'rxjs';
import * as https from 'https';
import * as fs from 'fs';
import { IncomingMessage } from 'webpack-dev-server';
import { decodeToken } from './db/auth';
import { RepositoryFactory } from './repository/repository_factory';
import { SessionStatus } from './model/session';
import { initializeSequelize } from './db/sequelize';


interface MessageEvent {
  ws: WebSocket;
  message: string;
}

const serverOptions = {
  cert: fs.readFileSync('src/websocket_keys/server.cert'),
  key: fs.readFileSync('src/websocket_keys/server.key'),
};

const server = new https.Server(serverOptions);
const wss = new WebSocket.Server({ server });
const messageSubject = new Subject<MessageEvent>();

/**
 *  Start websocket server. The url is expected to be formatted as `/sessions/{sessionId}`
 */
wss.on('connection', async (ws: WebSocket, req: IncomingMessage) => {
  const sessionRepository = new RepositoryFactory().sessionRepository();

  // Retrieve and decode JWT
  const authHeader = req.headers.authorization;
  if (typeof authHeader === 'undefined')
    return ws.close(1008, 'Token not found');
  let decodedToken;
  try {
    decodedToken = await decodeToken(authHeader.split(' ')[1]);
  } catch (error) {
    return ws.close(1008, 'Invalid token');
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

  // Notify listeners on message event
  ws.on('message', (message: string) => messageSubject.next({ ws, message }));
  ws.on('close', async () => {
    session.connectedUserUIDs = session.connectedUserUIDs?.filter(item => item !== decodedToken.userUID);
    await sessionRepository.update(session.id, { connectedUserUIDs: session.connectedUserUIDs });
  });

  // Answer the client about the success of the operation
  ws.send(JSON.stringify({ message: `Welcome to session "${session.name}", ${decodedToken.username}!`, userUID: decodedToken.userUID }));

  session.connectedUserUIDs ??= [];
  session.connectedUserUIDs?.push(decodedToken.userUID);
  await sessionRepository.update(session.id, { connectedUserUIDs: session.connectedUserUIDs });
});

// Subscribe message handling listener
messageSubject.subscribe(({ ws, message }) => {
  wss.clients.forEach(client => {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ message: message.toString() }));
    }
  });
});

// Start websocket server
(async () => {
  await initializeSequelize();
  server.listen(8080, () => {
    console.log('Secure WebSocket server is running on wss://localhost:8080/');
  });
})();

