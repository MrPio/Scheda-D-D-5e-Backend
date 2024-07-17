import * as fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import * as admin from 'firebase-admin';
import { CachedToken } from '../model/cached_token';

const firebaseConfig = JSON.parse(fs.readFileSync('src/firebase_configs/firebase_config.json', 'utf8'));
const auth = getAuth(initializeApp(firebaseConfig));

/**
 * Get a JWT that is valid for 1 hour from Firebase Auth.
 * This is used for testing purposes only, where the back end is interacted 
 * with without the use of the front end mobile application.
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

export const decodeToken = async (token: string): Promise<CachedToken> => {
  const decodedToken = await admin.auth().verifyIdToken(token);
  return new CachedToken(token, decodedToken.iat, decodedToken.exp, decodedToken.name, decodedToken.user_id);
};