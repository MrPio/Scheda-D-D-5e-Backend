// `api_middleware.ts` Contains the checks to perform on HTTP requests received by the websocket container's API server.

import { NextFunction, Response } from 'express';
import { Error400Factory } from '../../error/error_factory';
import { verifyJWT } from '../../service/jwt_service';
import { IAugmentedRequest } from '../../interface/augmented_request';

const error400Factory: Error400Factory = new Error400Factory();

// Ensures that the client of the request is the API server backend
export const checkIsAPIBackend = (req: IAugmentedRequest, res: Response, next: NextFunction) => {
  // Check if JWT authorization is disabled for testing purposes.
  if ((process.env.USE_JWT ?? 'true') != 'true')
    return next();
  verifyJWT(req.token!, () => next(), () => error400Factory.invalidJWT().setStatus(res));
};

/**
 * Check that all the users are online in the session.
 * Otherwise no message can be sent to them through websocket.
 */
export const checkUsersOnline = async (req: IAugmentedRequest, res: Response, next: NextFunction) => {
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