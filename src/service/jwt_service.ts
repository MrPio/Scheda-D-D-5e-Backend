import jwt, { JwtPayload } from 'jsonwebtoken';
import fs from 'fs';

/**
 * `jwt_service.ts` is used to generate signed JWT and to verify them.
 * This is used to mediate the communication between the API Backend and the websocket container's API server.
 * The JWT is generated with the websocket private key and verified against its public key.
 * NOTE: There is no versioning of the private key.
 */

const privateKey = fs.readFileSync('src/websocket_keys/server.key', 'utf8');
const publicKey = fs.readFileSync('src/websocket_keys/server.cert', 'utf8');

/**
 * Generate a JWT using websocket private key
 * @returns a signed JWT
 */
export const generateJWT = (): string =>
  jwt.sign({ role: 'API Backend' }, privateKey, {
    algorithm: 'RS256',
    expiresIn: '15m',
  });

/**
 * Verify the given JWT against the websocket public key.
 * Calls a callback based on the validity of the token.
 * If valid, the JWT payload is decoded and passed as argument.
 */
export const verifyJWT = (token: string, onValid?: (decodedToken: string | JwtPayload) => void, onInvalid?: () => void): void => {
  jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err, decoded) =>
    (err ? onInvalid?.call(this) : onValid?.call(this, decoded!)));
};