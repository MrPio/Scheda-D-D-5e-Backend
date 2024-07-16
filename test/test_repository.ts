import { SequelizeRepository } from '../src/repository/sequelize_repository';
import sequelize from '../src/db/sequelize';
import { Session, SessionStatus } from '../src/model/session';
import Character from '../src/model/character';
import { FirestoreRepository } from '../src/repository/firestore_repository';

async function testSequelizeRepository() {
  try {
    await sequelize.sync({ force: true });

    const sessionRepository = new SequelizeRepository(Session);

    const newSession = await sessionRepository.create({
      name: 'Session1',
      masterUID: 'master123',
      sessionStatus: SessionStatus.ongoing,
    } as Session);

    console.log('Nuova sessione creata:', newSession.toJSON());

    const loadedSession = await sessionRepository.getById(newSession.id.toString());
    if (loadedSession) {
      console.log('Sessione caricata dal database:', loadedSession.toJSON());
    } else {
      console.log('Sessione non trovata.');
    }
  } catch (error) {
    console.error('Errore durante il test del repository Sequelize:', error);
  } finally {
    await sequelize.close();
  }
}

async function testFirestoreRepository() {
  const characterRepository = new FirestoreRepository<Character>(
    'characters',
    Character.fromJSON,
  );

  const newCharacter = new Character(
    'author123',
    'Hero',
    100,
    100,
    18,
    [],
    false,
    30,
    [],
    new Map(),
    new Map(),
    [],
    new Map(),
    new Map(),
  );

  try {
    const createdCharacter = await characterRepository.create(newCharacter);
    console.log('Nuovo personaggio creato:', createdCharacter.toJSON());

    const updatedCharacter = await characterRepository.update(createdCharacter.uid!, {
      ...createdCharacter,
      _name: 'Updated Hero',
    } as Character);

    if (updatedCharacter) {
      console.log('Personaggio aggiornato:', updatedCharacter.toJSON());
    } else {
      console.log('Personaggio non trovato per l\'aggiornamento.');
    }
  } catch (error) {
    console.error('Errore durante il test del repository Firestore:', error);
  }
}

(async () => {
  //await testSequelizeRepository();
  await testFirestoreRepository();
})();
