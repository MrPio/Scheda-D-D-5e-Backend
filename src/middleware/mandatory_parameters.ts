import { Response, NextFunction } from 'express';
import { IAugmentedRequest } from '../interface/augmented_request';
import { Error400Factory } from '../error/error_factory';

export function checkMandadoryParams(mandatoryParams: string[]) {
  return (req: IAugmentedRequest, res: Response, next: NextFunction) => {
    for (const param of mandatoryParams)
      if (!(param in req.body))
        return new Error400Factory().missingMandatoryParam(param).setStatus(res);
    next();
  };
}