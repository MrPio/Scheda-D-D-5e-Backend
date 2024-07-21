
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

/**
 * Define the supertype of enum types. 
 * This is used to assign an enum type to the `ENUM' parametric function to avoid lint errors.
 */
type Enum<E> = Record<keyof E, number | string> & { [k: number]: string };

/**
 * Define type checking function using HOF pogramming.
 * For instance, `ARRAY(STRING)` returns a function that checks if a given `object` is of type `string[]`.
 */
export const STRING = (obj: object) => typeof obj === 'string';
export const NUMBER = (obj: object) => typeof obj === 'number';
export const BOOLEAN = (obj: object) => typeof obj === 'boolean';
export const ENUM = <E>(e: Enum<E>) => (obj: object) => (STRING(obj) || NUMBER(obj)) && Object.keys(e).includes((obj as object).toString());
export const ARRAY =
  (next: (arg0: object) => boolean) =>
    (obj: object) =>
      Array.isArray(obj) && obj.every(it => next(it));

// For object of type {key1: ValueType1, ..., keyN: ValueTypeN}
export const OBJECT =
  (objectType: { [key: string]: (arg0: object) => boolean }) =>
    (obj: object) =>
      Object.entries(obj).every(it => objectType[it[0]](it[1]));

// For object of type {[key: KeyType]: ValueType}
export const OBJECT_ARRAY =
  (key: (arg0: object) => boolean, value: (arg0: object) => boolean) =>
    (obj: object) =>
      Object.entries(obj).every(it => key(it[0] as unknown as object) && value(it[1]));


/**
 * Checks that the request body parameters are of the correct types .
 * NOTE: This does not check for mandatory parameters in the request body, but treats them all as optional,
 * meaning that the type is only checked if the parameter is present in the request body. Therefore, this
 * middleware should always be called after `checkMandadoryParams`.
 * @param mandatoryParams the list of mandadory parameters
 * @returns a middleware function that performs the check. 
 */
export function checkParamsType(paramsTypes: { [key: string]: (arg0: object) => boolean }) {
  return (req: IAugmentedRequest, res: Response, next: NextFunction) => {
    for (const entry of Object.entries(paramsTypes))
      if (entry[0] in req.body && !entry[1](req.body[entry[0]]))
        return new Error400Factory().wrongParameterType(entry[0]).setStatus(res);
    next();
  };
}

