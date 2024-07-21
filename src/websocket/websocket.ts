/**
 * `websocket.ts` is the websocket container entry point.
 * The websocket only accepts connections from clients authenticated by JWT as players in an existing, ongoing session.
 * 
 * It is assumed that, for a given 'session', **no two communications with players responses can be started at the same time**.
 * In other words, if the master has already asked some players to roll, It is not possible to request more dice rolls 
 * before the previous request has finished, either because all players have responded or because of a timeout.
 * 
 * # Handling multiple player interactions
 * 
 * There are cases, such as in the `/sessions/:sessionId/savingThrow' route, where the API backend needs a subset of
 * the session's players to roll some dice. The time sequence is as follows:
 * 
 * |----> [Master] - request saving throw to some players.
 * |----|----> [APIBackend] - asks the websocket server to request the dice roll to each of those players.
 * |----|----|----> [WebsocketAPIServer] - asks the websocket server to make players roll the dice.
 * |----|----|----|----> [WebsocketServer] - asks the players to roll the dice.
 * |----|----|----|----|----> [Player1] - roll dice.
 * |----|----|----|----|----> ...
 * |----|----|----|----|----> [PlayerN] - roll dice.
 * |----|----|----|----> [WebsocketServer] - returns the list of the rolls results.
 * |----|----|----> [WebsocketAPIServer] - returns the list of the rolls results.
 * |----|---> [APIBackend] - uses that list to determine the outcome.
 * |----> [Master] - receives the HTTP response.
 * 
 * A timeout will be used by the API backend to avoid starvation.
 * If one of the players disconnects, the operation is aborted and an error message is returned to the master.
 */

import dotenv from 'dotenv';
dotenv.config();
// If not in production, load the development .env file
if ((process.env.NODE_ENV ?? 'prod') === 'dev') {
  console.warn('Development enviroment active ---> load .dev.env');
  dotenv.config({ path: '.dev.env' });
}

import WebSocket from 'ws';
import { catchError, of, Subject, Subscription, switchMap, takeUntil, timer } from 'rxjs';
import * as https from 'https';
import * as fs from 'fs';
import { IncomingMessage } from 'webpack-dev-server';
import { RepositoryFactory } from '../repository/repository_factory';
import { initializeSequelize } from '../db/sequelize';
import { CachedToken } from '../model/cached_token';
import express, { Response, json } from 'express';
import { Session, SessionStatus } from '../model/session';
import { checkJWT, checkSession, IConnectionFailError } from './middleware/websocket_middleware';
import { checkHasToken } from '../middleware/jwt_middleware';
import { checkIsAPIBackend, checkUsersOnline } from './middleware/api_middleware';
import { generateJWT } from '../service/jwt_service';
import { Error400Factory, Error500Factory } from '../error/error_factory';
import { IAugmentedRequest } from '../interface/augmented_request';
import { ARRAY, checkMandadoryParams, checkParamsType, ENUM, NUMBER, OBJECT_ARRAY, STRING } from '../middleware/parameters_middleware';
import { Dice } from '../model/dice';
import { checkSessionExists, checkSessionStatus } from '../middleware/session_middleware';
import { ActionType, HistoryMessage } from '../model/history_message';



const serverOptions = {
  cert: fs.readFileSync('src/websocket_keys/server.cert'),
  key: fs.readFileSync('src/websocket_keys/server.key'),
};

/**
 * The container of all the active connections.
 * They are grouped by session ID. This means that the same player could be connected to two different sessions 
 * at the same time, but with two different websocket connections.
 */
type Connections = {
  [sessionId: string]: {

    // The observer that is notified when a player with a pending request sends a message to the websocket server.
    subject: Subject<{ ws: WebSocket, message: string, session: Session, userUID: string }>,

    // The subscription to the subject. It is unsubscribed when there is no more a pending request.
    subscription?: Subscription,

    // The users connected to the session. Their UIDs are also stored inside the `onlineUserUIDs` list of the `Session` object.
    users: {
      [userUID: string]:
      {
        // The connection of a player to a session.
        webSocket: WebSocket,

        // Determines if this player has a pending request, like a dice to roll.
        pendingRequest: boolean,
      }
    }
  }
};

/**
 * The format of the client messages.
 * All websocket client messages, except those responding to the API backend such as a dice roll request, must be formatted as follows.
 */
type BroadcastMessage = {
  message: string,
  addresseeUIDs?: string[]
};
const server = new https.Server(serverOptions);
const wss = new WebSocket.Server({ server });
const activeConnections: Connections = {};
const onOpenSubject = new Subject<{ ws: WebSocket, session: Session, userUID: string, username: string }>();
const onCloseSubject = new Subject<{ ws: WebSocket, session: Session, userUID: string }>();
const sessionRepository = new RepositoryFactory().sessionRepository();
const historyRepository = new RepositoryFactory().historyRepository();
const error500Factory: Error500Factory = new Error500Factory();
const error400Factory: Error400Factory = new Error400Factory();

/**
 * A cancel timeout subject.
 * It is used to cancel the timeout observable.
 */
const timeoutLimit = 2 * 60 * 1000; // 2 min
const cancelTimeout = new Subject<void>();
const abortSubject = new Subject<{ isTimeout: boolean }>();
let abortSubscription: Subscription;

/**
 * Accumulates the players responses before sending them back to the API backend.
 * For example, if a dice roll request has been sent to multiple clients, the dice results will be in
 * `requestResponses`, and then when the last player responds, they are sent back to the API backend.
 */
let requestResponses: { [key: string]: object } = {};

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
  if (!(session.id in activeConnections)) {
    activeConnections[session.id] = { subject: new Subject(), users: {} };

    // Subscribe message broadcaster listener.
    activeConnections[session.id].subject.subscribe(async ({ userUID: senderUID, message }) => {

      // If the player has a pending request, don't broadcast its message
      if (activeConnections[session.id].users[senderUID].pendingRequest) return;
      try {
        // Try to cast the received message to the BroadcastMessage type
        const jsonMessage = JSON.parse(message) as BroadcastMessage;

        // Create a new history message
        await historyRepository.create({ msg: jsonMessage.message, actionType: ActionType.chat, sessionId: session.id } as HistoryMessage);

        // Echo the message to all connected players in the session except the sender, or to a subset of them if addresseeUIDs was specified.
        Object.entries(activeConnections[session.id].users).forEach(user => {
          if (user[0] != senderUID && (!jsonMessage.addresseeUIDs || jsonMessage.addresseeUIDs.includes(user[0])))
            user[1].webSocket.send(JSON.stringify({ authorUID: senderUID, message: jsonMessage.message }));
        });
      } catch { }
    });
  }
  activeConnections[session.id].users[userUID] = { webSocket: ws, pendingRequest: false };

  // Notify listners on this new websocket connection events.
  ws.on('message', (message: string) => activeConnections[session.id].subject.next({ ws, session, userUID, message }));
  ws.on('close', () => onCloseSubject.next({ ws, session, userUID }));
});

// Subscribe connection closed listener
onCloseSubject.subscribe(async ({ session, userUID }) => {

  // Remove the client userUID from the list of online users for the session.
  session.onlineUserUIDs = session.onlineUserUIDs?.filter(item => item !== userUID);
  await sessionRepository.update(session.id, { onlineUserUIDs: session.onlineUserUIDs });

  // If the disconnected player was involved in a request operation, such as a dice roll, abort that operation
  if (activeConnections[session.id].users[userUID].pendingRequest) {
    cancelTimeout.next();
    abortSubject.next({ isTimeout: false });
  }

  // Remove the ws connection object from the list of active connections
  delete activeConnections[session.id].users[userUID];
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

// Determine if a given session has a pending request.
const hasPendingRequest = (sessionId: string) => Object.values(activeConnections[sessionId].users).some(it => it.pendingRequest);

/**
 * Aborting the API backend request, either due to a timeout error or player disconnection.
 * @param sessionId the session in which the request was sent.
 * @param res the API backend response object
 */
const abortRequest = (sessionId: string, res: Response, isTimeout: boolean) => {
  for (const user of Object.values(activeConnections[sessionId].users)) {
    if (user.pendingRequest)
      user.webSocket.send(JSON.stringify({ error: 'timeout', message: 'The players took too much time to answer. Operation aborted!' }));
    user.pendingRequest = false;
  }
  (isTimeout ? error400Factory.clientTimeout() : error400Factory.clientDisconnected()).setStatus(res);
  requestResponses = {};
  activeConnections[sessionId].subscription?.unsubscribe();
};

/**
 * Communication Routes ========================================================================
 * These are the routes used by API backend to communicate with websocket server.
 */

/**
 * `requestDiceRoll/` route.
 * The request body is expected to be as follows.
 * {
 *   "diceList": [ "d10", "d4", "d6" ],   
 *   "addresseeUIDs": [ "k9vc0kojNcO9JB9qVdf33F6h3eD2" ],
 *   "modifiers": "[ { "k9vc0kojNcO9JB9qVdf33F6h3eD2" : 2 } ]"
 * }
 */
app.post('/sessions/:sessionId/requestDiceRoll',
  checkHasToken,
  checkIsAPIBackend,
  checkMandadoryParams(['diceList', 'addresseeUIDs', 'modifiers']),
  checkParamsType({ diceList: ARRAY(ENUM(Dice)), addresseeUIDs: ARRAY(STRING), modifiers: OBJECT_ARRAY(STRING, NUMBER) }),
  checkSessionExists,
  checkSessionStatus([SessionStatus.ongoing]),
  checkUsersOnline,
  (req: IAugmentedRequest, res: Response) => {

    // Check that the active connection stores the connection of interest. This should always be true.
    if (!(req.sessionId! in activeConnections) || req.addresseeUIDs?.some(uid => !(uid in activeConnections[req.sessionId!].users)))
      return error500Factory.genericError().setStatus(res);

    // Check that the specified session does not already have a pending request.
    if (hasPendingRequest(req.sessionId!))
      return error400Factory.websocketRequestAlreadyPending(req.sessionId!).setStatus(res);

    // Request the players involved to roll the dice and update their pending status.
    for (const userUID of req.addresseeUIDs!) {
      activeConnections[req.sessionId!].users[userUID].webSocket.send(JSON.stringify({ action: 'diceRoll', modifier: req.body.modifiers[userUID] ?? 0, diceList: req.body.diceList as string[] }));
      activeConnections[req.sessionId!].users[userUID].pendingRequest = true;
    }

    // When the player answer, send the HTTP response to the API backend.
    activeConnections[req.sessionId!].subscription = activeConnections[req.sessionId!].subject.subscribe(({ ws, message, userUID }) => {

      // Check that the sender had a pending request, otherwise ignore its message.  
      if (!activeConnections[req.sessionId!].users[userUID].pendingRequest) return;

      // Check that the provided dice result is an integer.
      if (!Number.isInteger(Number(message)))
        ws.send(JSON.stringify({ action: 'diceRoll', diceList: req.body.diceList as string[], error: `"${message}" is not an integer! Please retry.` }));
      else {
        activeConnections[req.sessionId!].users[userUID].pendingRequest = false;
        requestResponses[userUID] = { diceRoll: Number.parseInt(message), answerTimestamp: Date.now() };

        // If this was the last player to answer, send the result back to the API backend and unsubscribe this listner.
        if (!hasPendingRequest(req.sessionId!)) {

          // Cancel timeout emitter
          cancelTimeout.next();
          res.json(requestResponses);
          requestResponses = {};
          activeConnections[req.sessionId!].subscription?.unsubscribe();
        }
      }
    });

    // Set a timeout to prevent starvation. It is used to prevent starvation when waiting for players responses.
    timer(timeoutLimit)
      .pipe(takeUntil(cancelTimeout))
      .subscribe(() => abortSubject.next({ isTimeout: true }));

    // Register the abort operation on the abort subject
    if (abortSubscription) abortSubscription.unsubscribe();
    abortSubscription = abortSubject.subscribe(({ isTimeout }) => abortRequest(req.sessionId!, res, isTimeout));
  });

/**
 * `requestReaction/` route.
 * The request body is expected to be as follows.
 * {
 *   "addresseeUIDs": [ "k9vc0kojNcO9JB9qVdf33F6h3eD2" ]
 * }
 */
app.post('/sessions/:sessionId/requestReaction', checkHasToken, checkIsAPIBackend, checkMandadoryParams(['addresseeUIDs']), checkParamsType({ addresseeUIDs: ARRAY(STRING) }), checkSessionExists, checkSessionStatus([SessionStatus.ongoing]), checkUsersOnline, (req: IAugmentedRequest, res: Response) => {

  // Check that the active connection stores the connection of interest. This should always be true.
  if (!(req.sessionId! in activeConnections) || req.addresseeUIDs?.some(uid => !(uid in activeConnections[req.sessionId!].users)))
    return error500Factory.genericError().setStatus(res);

  // Check that the specified session does not already have a pending request.
  if (hasPendingRequest(req.sessionId!))
    return error400Factory.websocketRequestAlreadyPending(req.sessionId!).setStatus(res);

  // Request the players involved to roll the dice and update their pending status.
  for (const userUID of req.addresseeUIDs!) {
    activeConnections[req.sessionId!].users[userUID].webSocket.send(JSON.stringify({ action: 'useReaction' }));
    activeConnections[req.sessionId!].users[userUID].pendingRequest = true;
  }

  // When the player answer, send the HTTP response to the API backend.
  activeConnections[req.sessionId!].subscription = activeConnections[req.sessionId!].subject.subscribe(({ ws, message, userUID }) => {

    // Check that the sender had a pending request, otherwise ignore its message.  
    if (!activeConnections[req.sessionId!].users[userUID].pendingRequest) return;

    // Check that the provided dice result is an integer.
    if (message != 'true' && message != 'false')
      ws.send(JSON.stringify({ action: 'useReaction', error: `"${message}" is not a boolean! Please retry.` }));
    else {
      activeConnections[req.sessionId!].users[userUID].pendingRequest = false;
      requestResponses[userUID] = { choice: message == 'true', answerTimestamp: Date.now() };

      // If this was the last player to answer, send the result back to the API backend and unsubscribe this listner.
      if (!hasPendingRequest(req.sessionId!)) {

        // Cancel timeout emitter
        cancelTimeout.next();
        res.json(requestResponses);
        requestResponses = {};
        activeConnections[req.sessionId!].subscription?.unsubscribe();
      }
    }
  });

  // Set a timeout to prevent starvation. It is used to prevent starvation when waiting for players responses.
  timer(timeoutLimit)
    .pipe(takeUntil(cancelTimeout))
    .subscribe(() => abortSubject.next({ isTimeout: true }));

  // Register the abort operation on the abort subject
  if (abortSubscription) abortSubscription.unsubscribe();
  abortSubscription = abortSubject.subscribe(({ isTimeout }) => abortRequest(req.sessionId!, res, isTimeout));
});

// Start websocket and API servers
(async () => {
  // Initialize sequelize ORM. If in dev environment, clear the database and run the seeders.
  await initializeSequelize({
    force: (process.env.NODE_ENV ?? 'prod') === 'dev',
    seed: (process.env.NODE_ENV ?? 'prod') === 'dev',
  });
  server.listen(8080, () => console.log('Server WSS is running on port 8080'));
  app.listen(3001, () => console.log('Server API is running on port 3001'));
})();