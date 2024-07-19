import WebSocket from 'ws';
import { CachedToken } from '../../model/cached_token';
import { IAugmentedRequest } from '../websocket';
import { decodeToken } from '../../db/auth';
import { RepositoryFactory } from '../../repository/repository_factory';
import { SessionStatus } from '../../model/session';

export interface IConnectionFailError {
  statusCode: number,
  message: string,
}

const sessionRepository = new RepositoryFactory().sessionRepository();

/**
 * `websocket_middleware.ts` contains the checks to perform on websocket connection establishment requests.
 * These checks include JWT authentication, session existence and the client's role within the session.
 */

/**
 * Check that the request header contains a token and that it is a valid JWT.
 * The JWT is validated against the Firebase Auth public key and 
 * then decoded with the public key to check its expiration.
 * To avoid multiple requests to Firebase Auth with the same token,
 * the JWT is stored in the Redis cache with a short TTL. 
 */
export const checkJWT = async (ws: WebSocket, req: IAugmentedRequest): Promise<void> => {

  // Check if JWT authorization is disabled for testing purposes.
  if ((process.env.USE_JWT ?? 'true') != 'true') {
    req.token = 'k9vc0kojNcO9JB9qVdf33F6h3eD2';
    req.decodedToken = new CachedToken(req.token, 'debug_token', 0, 0, 'Developer');
  } else {

    // Retrieve and decode JWT
    req.token = req.headers.authorization;
    if (typeof req.token === 'undefined')
      return Promise.reject({ statusCode: 1008, message: 'Token not found' } as IConnectionFailError);
    try {
      req.decodedToken = await decodeToken(req.token.split(' ')[1]);
    } catch (error) {
      return Promise.reject({ statusCode: 1008, message: 'Invalid token' } as IConnectionFailError);
    }
  }
  return Promise.resolve();
};

/**
 * Check that the client has specified the session they wish to connect to in the URL.
 * Check that the ID provided leads to an existing session and that the client has the role of Player or Master.
 * Check that the session is in an "Ongoing" status, otherwise the connection cannot be established.
 */
export const checkSession = async (ws: WebSocket, req: IAugmentedRequest) => {

  // Retrieve session
  req.sessionId = req.url?.split('sessions/')[1];
  if (!req.sessionId)
    return Promise.reject({ statusCode: 1008, message: 'Session id not provided' } as IConnectionFailError);

  const session = await sessionRepository.getById(req.sessionId);
  if (!session)
    return Promise.reject({ statusCode: 1008, message: 'Session not found' } as IConnectionFailError);

  // Check if the user is in the session
  if (!session.userUIDs?.includes(req.decodedToken!.userUID) && session.masterUID !== req.decodedToken!.userUID)
    return Promise.reject({ statusCode: 1008, message: `User "${req.decodedToken!.username}" is not part of the session "${session.name}"` } as IConnectionFailError);

  // Check if the session is ongoing
  if (session.sessionStatus !== SessionStatus.ongoing)
    return Promise.reject({ statusCode: 1008, message: `Session "${session.name}" is not in Ongoing state` } as IConnectionFailError);
  return Promise.resolve();
};