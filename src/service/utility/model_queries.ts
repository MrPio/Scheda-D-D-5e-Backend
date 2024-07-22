import IEntity, { EntityType } from '../../model/entity';
import { EntityTurn } from '../../model/entity_turn';
import { Session } from '../../model/session';
import { RepositoryFactory } from '../../repository/repository_factory';

const sessionRepository = new RepositoryFactory().sessionRepository();
const characterRepository = new RepositoryFactory().characterRepository();
const npcRepository = new RepositoryFactory().npcRepository();
const monsterRepository = new RepositoryFactory().monsterRepository();
const entityTurnRepository = new RepositoryFactory().entityTurnRepository();

/**
 * Helper function to find an `Entity` by entityId in the session.
 * @param session The Session object containing the entityId.
 * @param entityId The entityId to search for.
 * @returns The `Entity` object with its `EntityType` if found, otherwise undefined.
 */
export async function findEntity(session: Session, entityId: string): Promise<{ entityType: EntityType; entity: IEntity; } | undefined> {
  if (session.characterUIDs?.includes(entityId))
    return { entityType: EntityType.character, entity: (await characterRepository.getById(entityId))! };
  else if (session.npcUIDs?.includes(entityId))
    return { entityType: EntityType.npc, entity: (await npcRepository.getById(entityId))! };
  else if (session.monsterUIDs?.includes(entityId))
    return { entityType: EntityType.monster, entity: (await monsterRepository.getById(entityId))! };
}

/**
 * Helper function to update an `Entity` by entityId in the session.
 * @param session The Session object containing the entityId.
 * @param entityId The entityId to search for.
 * @param newEntity The updated fields.
 */
export async function updateEntity(session: Session, entityId: string, newEntity: Partial<IEntity>): Promise<void> {
  if (session.characterUIDs?.includes(entityId))
    characterRepository.update(entityId, newEntity);
  else if (session.npcUIDs?.includes(entityId))
    npcRepository.update(entityId, newEntity);
  else if (session.monsterUIDs?.includes(entityId))
    monsterRepository.update(entityId, newEntity);
}

/**
 * Helper function to delete an `Entity` by entityId in the session.
 * @param session The Session object containing the entityId.
 * @param entityId The entityId to search for.
 */
export async function deleteEntity(session: Session, entityId: string): Promise<void> {
  if (session.characterUIDs?.includes(entityId))
    sessionRepository.update(session.id, { characterUIDs: session.characterUIDs.filter(it => it !== entityId) });
  else if (session.npcUIDs?.includes(entityId))
    sessionRepository.update(session.id, { npcUIDs: session.npcUIDs.filter(it => it !== entityId) });
  else if (session.monsterUIDs?.includes(entityId))
    monsterRepository.delete(entityId);
  entityTurnRepository.delete(session.entityTurns.find(it => it.entityUID == entityId)?.id);
}

/**
 * Helper function to find an `EntityTurn` by entityId in the session.
 * @param session The Session object containing entityTurns.
 * @param entityId The entityId to search for.
 * @returns The `EntityTurn` object if found, otherwise undefined.
 */
export function findEntityTurn(session: Session, entityId: string): EntityTurn | undefined {
  return session.entityTurns.find(turn => turn.entityUID === entityId);
}