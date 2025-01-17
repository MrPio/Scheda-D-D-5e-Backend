import { NextFunction, Response } from 'express';
import { Error400Factory, Error500Factory } from '../error/error_factory';
import { decodeToken } from '../db/auth';
import { CachedToken } from '../model/cached_token';
import { IAugmentedRequest } from '../interface/augmented_request';

const error400Factory: Error400Factory = new Error400Factory();
const error500Factory: Error500Factory = new Error500Factory();

/**
 * Check that the request header contains a token.
 * This middleware does not check the validity of such a token.
 */
export const checkHasToken = async (req: IAugmentedRequest, res: Response, next: NextFunction) => {
  // Check if JWT authorization is disabled for testing purposes.
  if ((process.env.USE_JWT ?? 'true') != 'true')
    return next();
  const authHeader = req.headers.authorization;
  if (typeof authHeader !== 'undefined') {
    req.token = authHeader.split(' ')[1];
    next();
  } else
    error400Factory.noJWT().setStatus(res);
};

/**
 * Check the validity of the provided JWT.
 * The JWT is validated against the Firebase Auth public key and 
 * then decoded with the public key to check its expiration.
 * To avoid multiple requests to Firebase Auth with the same token,
 * the JWT is stored in the Redis cache with a short TTL. 
 */
export const checkTokenIsValid = async (req: IAugmentedRequest, res: Response, next: NextFunction) => {
  // Check if JWT authorization is disabled for testing purposes.
  if ((process.env.USE_JWT ?? 'true') != 'true') {
    req.decodedToken = new CachedToken('k9vc0kojNcO9JB9qVdf33F6h3eD2', 'debug_token', 0, 0, 'Developer');
    return next();
  }
  try {
    req.decodedToken = await decodeToken(req.token!);
    next();
  } catch (error) {
    if (error instanceof Object && 'code' in error) {
      if (error.code === 'auth/argument-error')
        error400Factory.wrongFormatJWT().setStatus(res);
      else if (error.code === 'auth/id-token-expired')
        error400Factory.expiredJWT().setStatus(res);
      else error400Factory.invalidJWT().setStatus(res);
    } else error500Factory.genericError().setStatus(res);
  }
};