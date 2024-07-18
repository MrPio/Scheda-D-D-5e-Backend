import sequelize, { initializeSequelize } from '../src/db/sequelize';
import { Session, SessionStatus } from '../src/model/session';
import { assert } from 'console';
import { RepositoryFactory } from '../src/repository/repository_factory';
import { redis } from '../src/db/redis';
import { EntityTurn } from '../src/model/entity_turn';

async function testSequelizeRepository() {
  await initializeSequelize(true);
  const sessionRepository = new RepositoryFactory().sessionRepository();
  const newSessionStatus = SessionStatus.ongoing;

  // Create a new session inside the 'sessions' table
  let session = await sessionRepository.create({
    name: 'Session1',
    masterUID: 'master123',
    userUIDs:['k9vc0kojNcO9JB9qVdf33F6h3eD2'],
    sessionStatus: SessionStatus.created,
  } as Session);
  console.log('Session created, status =', session.sessionStatus);
  
  // Eager Loading session
  await EntityTurn.create({ entityUID: 'abc', posX: 0, posY: 3, sessionId: session.id } as EntityTurn);
  session = (await sessionRepository.getById(session.id))!;
  assert(session.entityTurns.length === 1);

  // Update the session status value
  await sessionRepository.update(session.id, { sessionStatus: newSessionStatus });

  // Check the new status value
  const newSession = await sessionRepository.getById(session.id);
  console.log('Session updated, new status =', newSession?.sessionStatus);
  assert(newSession?.sessionStatus === newSessionStatus);

  sequelize.close();
}

async function testFirestoreRepository() {
  const characterRepository = new RepositoryFactory().characterRepository();
  const existingCharacterUID = 'y3XoTWriYvkNgQMNLSPF';
  const newAC = 99;

  // Look for an existing character
  const character = await characterRepository.getById(existingCharacterUID);
  assert(character);
  console.log('Character found, UID =', character!.uid);

  // Update the character AC value
  await characterRepository.update(character!.uid!, { armorClass: newAC });

  // Check the new AC value
  const newCharacter = await characterRepository.getById(existingCharacterUID);
  console.log('Character updated, new AC =', newCharacter!.armorClass);
  assert(newCharacter!.armorClass === newAC);

  // Restore the character old AC value
  await characterRepository.update(character!.uid!, { armorClass: character!.armorClass });
}

(async () => {
  console.log('Launching Sequelize repository test ...');
  await testSequelizeRepository();
  console.log('Launching Firestore repository test ...');
  await testFirestoreRepository();
  redis?.disconnect();
})();
