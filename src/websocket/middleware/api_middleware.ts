// `api_middleware.ts` Contains the checks to perform on HTTP requests received by the websocket container's API server.

import { NextFunction, Response } from 'express';
import { Error400Factory } from '../../error/error_factory';
import { verifyJWT } from '../../service/jwt_service';
import { RepositoryFactory } from '../../repository/repository_factory';
import { SessionStatus } from '../../model/session';
import { IAugmentedRequest } from '../../interface/augmented_request';

const sessionRepository = new RepositoryFactory().sessionRepository();
const error400Factory: Error400Factory = new Error400Factory();

// Ensures that the client of the request is the API server backend
export const checkIsAPIBackend = (req: IAugmentedRequest, res: Response, next: NextFunction) => {
  // Check if JWT authorization is disabled for testing purposes.
  if ((process.env.USE_JWT ?? 'true') != 'true')
    return next();
  verifyJWT(req.token!, () => next(), () => error400Factory.invalidJWT().setStatus(res));
};

/**
 * Check that the provided `sessionID` belongs to an existing session.
 * Check that that session status is set to "Ongoing"
 */
export const checkSessionExists = async (req: IAugmentedRequest, res: Response, next: NextFunction) => {

  // Check that the `sessionId` parameter has been provided.
  if (!('sessionId' in req.params))
    return error400Factory.missingMandatoryParam('sessionId').setStatus(res);
  req.sessionId = req.params.sessionId;

  // Check that the `sessionId` belongs to an existing session.
  req.session = (await sessionRepository.getById(req.sessionId))!;
  if (!req.session)
    return error400Factory.sessionNotFound(req.sessionId).setStatus(res);

  // Check that the session is ongoing.
  if (req.session.sessionStatus !== SessionStatus.ongoing)
    return error400Factory.sessionInWrongState(req.session.name, SessionStatus.ongoing).setStatus(res);

  // All the checks succedeed.
  next();
};

/**
 * Check that all the users are online in the session.
 * Otherwise no message can be sent to them through websocket.
 */
export const checkUsersOnline = async (req: IAugmentedRequest, res: Response, next: NextFunction) => {

  // Check the validity of the `addresseeUIDs` body parameter.
  if (!Array.isArray(req.body.addresseeUIDs))
    return error400Factory.wrongParameterType('addresseeUIDs', 'string[]');
  req.addresseeUIDs = req.body.addresseeUIDs;
  
  for (const userUID of req.addresseeUIDs!) {

    // Check that the user is in the session
    if (!req.session!.userUIDs?.includes(userUID) && req.session!.masterUID !== userUID)
      return error400Factory.userNotInSession(req.sessionId!, userUID!).setStatus(res);

    // Check that the user is online in the session at the moment
    if (!req.session!.onlineUserUIDs?.includes(userUID))
      return error400Factory.userNotOnline(req.sessionId!, userUID!).setStatus(res);
  }

  // All the checks succedeed.
  next();
};