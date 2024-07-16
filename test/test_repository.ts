import { SequelizeRepository } from '../src/repository/sequelize_repository';
import sequelize, { initializeSequelize } from '../src/db/sequelize';
import { Session, SessionStatus } from '../src/model/session';
import Character from '../src/model/character';
import { FirestoreRepository } from '../src/repository/firestore_repository';
import { assert } from 'console';

async function testSequelizeRepository() {
  await initializeSequelize();
  const sessionRepository = new SequelizeRepository(Session);
  const newSessionStatus = SessionStatus.ongoing;

  // Create a new session inside the 'sessions' table
  const session = await sessionRepository.create({
    name: 'Session1',
    masterUID: 'master123',
    sessionStatus: SessionStatus.created,
  } as Session);
  console.log('Session created, status =', session.sessionStatus);

  // Update the session status value
  await sessionRepository.update(session.id, { sessionStatus: newSessionStatus });

  // Check the new status value
  const newSession = await sessionRepository.getById(session.id);
  console.log('Session updated, new status =', newSession?.sessionStatus);
  assert(newSession?.sessionStatus === newSessionStatus);

  sequelize.close();
}

async function testFirestoreRepository() {
  const characterRepository = new FirestoreRepository<Character>(
    'characters',
    Character.fromJSON,
  );
  const existingCharacterUID = 'y3XoTWriYvkNgQMNLSPF';
  const newAC = 99;

  // Look for an existing character
  const character = await characterRepository.getById(existingCharacterUID);
  console.log('Character found, UID =', character.uid);

  // Update the character AC value
  await characterRepository.update(character.uid!, { armorClass: newAC });

  // Check the new AC value
  const newCharacter = await characterRepository.getById(existingCharacterUID);
  console.log('Character updated, new AC =', newCharacter.armorClass);
  assert(newCharacter.armorClass === newAC);

  // Restore the character old AC value
  await characterRepository.update(character.uid!, { armorClass: character.armorClass });
}

(async () => {
  console.log('Launching Sequelize repository test ...');
  await testSequelizeRepository();
  console.log('Launching Firestore repository test ...');
  await testFirestoreRepository();
})();
