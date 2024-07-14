import { Request, Response, NextFunction } from 'express';
import express from 'express';
import * as admin from 'firebase-admin';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import * as fs from 'fs';
import {signInAndGetIdToken} from './request_token';

const serviceAccount = JSON.parse(fs.readFileSync('src/firebase_configs/service_account_key.json', 'utf8'));

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
export const db = admin.firestore();

const getDocument = async (collection: string, documentId: string) => {
    try {
        const docRef = db.collection(collection).doc(documentId);
        const doc = await docRef.get();
        if (doc.exists) {
            console.log('Document data:', doc.data());
        } else {
            console.log('No such document!');
        }
    } catch (error) {
        console.error('Error getting document:', error);
    }
};

var app = express();

const requestTime = (req: Request, res: Response, next: NextFunction) => {
    (req as any).requestTime = Date.now();
    next();
};

var checkHeader = function (req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        next();
    } else {
        let err = new Error("ahi ahi no auth header");
        res.sendStatus(403);
    }
};

interface RequestWithToken extends Request {
    token?: string;
    decoded_token?: DecodedIdToken;
}

const checkToken = function (req: RequestWithToken, res: Response, next: NextFunction) {
    const bearerHeader = req.headers.authorization;
    if (typeof bearerHeader !== 'undefined') {
        const bearerToken = bearerHeader.split(' ')[1];
        req.token = bearerToken;
        next();
    } else {
        res.sendStatus(403);
    }
};

const verifyToken = async (req: RequestWithToken, res: Response, next: NextFunction) => {
    try {
        const decodedToken = await admin.auth().verifyIdToken(req.token!);
        console.log('Token is valid:', decodedToken);
        req.decoded_token = decodedToken;
        next();

    } catch (error) {
        console.error('Error verifying token:', error);
        res.sendStatus(403);
    }
};

// app.use(requestTime);
// app.use(checkHeader);
// app.use(checkToken);
// app.use(verifyToken);

// An example endpoint. It will only succeed if the token is valid.
app.get('/', requestTime, checkHeader, checkToken, verifyToken, (req: RequestWithToken, res: Response) => {
    res.send('Hello World!');
});

// This endpoint retrieves the user document associated with the UID 
// of the JWT token from the Firebase Firestore DB. 
app.get('/user', requestTime, checkHeader, checkToken, verifyToken, (req: RequestWithToken, res: Response) => {
    getDocument('users', req.decoded_token!.uid)
    res.send(req.decoded_token!.name);
});

// This endpoint retrieves a 1 hour JWT from Firebase Auth.
app.get('/token', requestTime, async (req: RequestWithToken, res: Response) => {
    const token = await signInAndGetIdToken("valeriomorelli50@gmail.com", "aaaaaa");
    res.send(`Your JWT is ${token}`);
});

app.listen(3000, () => {
    console.log('Servers is running on port 3000');
});