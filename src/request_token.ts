import * as fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import jwt from 'jsonwebtoken';

/**
 * Run this script to retrieve a 1 hour JWT from Firebase Auth.
 * This is used to test the backend without using the front-end mobile application. 
 */

const firebaseConfig = JSON.parse(fs.readFileSync('src/firebase_configs/firebase_config.json', 'utf8'));

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export const signInAndGetIdToken = async (email: string, password: string): Promise<string | null> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const idToken = await user.getIdToken();
    console.log('ID Token:', idToken);
    return idToken;
  } catch (error) {
    console.error('Error signing in:', error);
    return null;
  }
};

export const getAndDecodeIdToken = () => {
  signInAndGetIdToken('valeriomorelli50@gmail.com', 'aaaaaa').then(token => {
    if (token) {
      const decoded = jwt.decode(token);
      console.log(decoded);
    } else {
      console.error('Firebase Auth didn\'t provide a JWT. Please try again.');
    }
  });
};

getAndDecodeIdToken();