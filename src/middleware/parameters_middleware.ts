import { Response, NextFunction } from 'express';
import { IAugmentedRequest } from '../interface/augmented_request';
import { Error400Factory } from '../error/error_factory';


/**
 * Checks if the request body contains all the mandadory parameters
 * @param mandatoryParams the list of mandadory parameters
 * @returns a middleware function that performs the check. 
 */
export function checkMandadoryParams(mandatoryParams: string[]) {
  return (req: IAugmentedRequest, res: Response, next: NextFunction) => {
    for (const param of mandatoryParams)
      if (!(param in req.body))
        return new Error400Factory().missingMandatoryParam(param).setStatus(res);
    next();
  };
}

type Enum<E> = Record<keyof E, number | string> & { [k: number]: string };
export const STRING = (obj: object) => typeof obj === 'string';
export const NUMBER = (obj: object) => typeof obj === 'number';
export const BOOLEAN = (obj: object) => typeof obj === 'boolean';
export const ENUM = <E>(e: Enum<E>) => (obj: object) => STRING(obj) && Object.keys(e).includes(obj as string);
export const ARRAY =
  (next: (arg0: object) => boolean) =>
    (obj: object) =>
      Array.isArray(obj) && obj.every(it => next(it));

/**
 * Checks that the request body parameters are of the correct types 
 * @param mandatoryParams the list of mandadory parameters
 * @returns a middleware function that performs the check. 
 */
export function checkParamsType(paramsTypes: { [key: string]: (arg0: object) => boolean }) {
  return (req: IAugmentedRequest, res: Response, next: NextFunction) => {
    for (const entry of Object.entries(paramsTypes))
      if (!entry[1](req.body[entry[0]]))
        return new Error400Factory().wrongParameterType(entry[0]).setStatus(res);
    next();
  };
}