import * as fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import * as admin from 'firebase-admin';
import { CachedToken } from '../model/cached_token';
import { RepositoryFactory } from '../repository/repository_factory';

const firebaseConfig = JSON.parse(fs.readFileSync('src/firebase_configs/firebase_config.json', 'utf8'));
const auth = getAuth(initializeApp(firebaseConfig));
const tokenRepository = new RepositoryFactory().tokenRepository();

/**
 * Get a JWT that is valid for 1 hour from Firebase Auth.
 * This is used for testing purposes only, where the back end is interacted 
 * with without the use of the front end mobile application.
 * @param email - The account's email
 * @param password - The account's password
 * @returns A new JWT token or `null` on error.
 */
export const signInAndGetIdToken = async (options: { email: string, password: string }): Promise<string | null> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, options.email, options.password);
    const user = userCredential.user;
    const idToken = await user.getIdToken();
    return idToken;
  } catch (error) {
    return null;
  }
};

/**
 * Ask Firebase Auth to verify a given token.
 * The decoded token is cached using Redis with a TTL=5min. 
 * This will prevent the Firebase Auth API from being called too many times on the same tokens.
 * @param token - The JWT token to validate.
 * @returns The decoded token encoded in a `CachedToken` instance.
 */
export const decodeToken = async (token: string, noCache: boolean = false): Promise<CachedToken> => {
  if (!noCache) {
    const cachedToken = await tokenRepository.getById(token);
    if (cachedToken)
      return cachedToken;
  }
  const decodedToken = await admin.auth().verifyIdToken(token);
  const cachedToken = new CachedToken(decodedToken.user_id, token, decodedToken.iat, decodedToken.exp, decodedToken.name);
  if (!noCache)
    await tokenRepository.create(cachedToken);
  return cachedToken;
};