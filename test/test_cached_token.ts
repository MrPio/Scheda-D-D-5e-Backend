import dotenv from 'dotenv';
import { decodeToken, signInAndGetIdToken } from '../src/db/auth';
import { RepositoryFactory } from '../src/repository/repository_factory';
import { assert } from 'console';
import { redis } from '../src/db/redis';

dotenv.config();

(async () => {
  const tokenRepository = new RepositoryFactory().tokenRepository();

  // Request a JWT from Firebase Auth
  console.log('Retriving JWT from Firebase Auth ...');
  const token = await signInAndGetIdToken({
    email: process.env.FIREBASE_AUTH_TEST_EMAIL ?? '',
    password: process.env.FIREBASE_AUTH_TEST_PASSWORD ?? '',
  });

  // Decode the JWT and cache it with Redis
  const cachedToken = await decodeToken(token!, true);
  tokenRepository.create(cachedToken);
  console.log('JWT successfully cached!');

  // Retrieve the token from the cache
  const newCachedToken = await tokenRepository.getById(token!);
  assert(newCachedToken?.username === 'Valerio Morelli');
  console.log('Username =', newCachedToken?.username);
  redis?.disconnect();
})();
