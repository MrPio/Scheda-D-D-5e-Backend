// `api_middleware.ts` Contains the checks to perform on HTTP requests received by the websocket container's API server.

import { NextFunction, Response } from 'express';
import { Error400Factory } from '../../error/error_factory';
import { IAugmentedRequest } from '../websocket';
import { verifyJWT } from '../../service/jwt_service';

const error400Factory: Error400Factory = new Error400Factory();

// Ensures that the client of the request is the API server backend
export const checkIsAPIBackend = (req: IAugmentedRequest, res: Response, next: NextFunction) => {
  verifyJWT(req.token!, (_decodedToken) => next(), () => error400Factory.invalidJWT().setStatus(res));
};
