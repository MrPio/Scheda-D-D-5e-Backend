import * as admin from 'firebase-admin';
import * as fs from 'fs';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const serviceAccount = JSON.parse(fs.readFileSync('service_account_key.json', 'utf8'));
const firebaseConfig = JSON.parse(fs.readFileSync('firebase_config.json', 'utf8'));

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const verifyToken = async (token: string): Promise<admin.auth.DecodedIdToken | null> => {
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        console.log('Token is valid:', decodedToken);
        return decodedToken;
    } catch (error) {
        console.error('Error verifying token:', error);
        return null;
    }
};

const signInAndGetIdToken = async (email: string, password: string): Promise<string | null> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const idToken = await user.getIdToken();
        console.log('ID Token:', idToken);
        return idToken;
    } catch (error) {
        console.error('Error signing in:', error);
        return null
    }
};

signInAndGetIdToken("valeriomorelli50@gmail.com", "aaaaaa").then(token => {
    verifyToken(token!).then(decodedToken => {
        if (decodedToken) {
            console.log('User ID:', decodedToken.uid);
        } else {
            console.log('Invalid token');
        }
    });
});