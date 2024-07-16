import { SequelizeRepository } from '../src/repository/sequelize_repository';
import sequelize from '../src/db/sequelize';
import { Session, SessionStatus } from '../src/model/session';

(async () => {
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
    console.error('Errore durante il test del repository:', error);
  } finally {
    await sequelize.close();
  }
})();
