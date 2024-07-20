import { Response as Res } from 'express';
import { RepositoryFactory } from '../repository/repository_factory';
import { Error400Factory } from '../error/error_factory';
import { IAugmentedRequest } from '../interface/augmented_request';
import { EntityType } from '../model/entity';


const errorFactory = new Error400Factory();
const repositoryFactory = new RepositoryFactory();
const sessionRepository = repositoryFactory.sessionRepository();
const monsterRepository = repositoryFactory.monsterRepository();

/**
 * This function adds an entity to a session based on the sessionId provided in the request parameters.
 * The entity type and details are specified in the request body.
 * Depending on the entity type, it updates the session accordingly.
 */
export async function addEntityService(req: IAugmentedRequest, res: Res) {
  const { sessionId } = req.params;
  const { entityType, entityInfo } = req.body;

  const session = await sessionRepository.getById(sessionId);

  let entity;
  if (entityType === EntityType.Monster) {
    // Create a new monster entity and add it to the session's monsters list
    entity = await monsterRepository.create({ ...entityInfo, sessionId: sessionId });
    session?.monsters.push(entity);
  } else if (entityType === EntityType.Npc) {
    // Add an NPC entity to the session's NPC UID list
    entity = { uid: entityInfo.uid }; // Assuming other entities only need UID
    session!.npcUIDs = session!.npcUIDs ? `${session!.npcUIDs},${entity.uid}` : entity.uid.toString();
  } else {
    // Add a character entity to the session's character UID list
    entity = { uid: entityInfo.uid }; // Assuming other entities only need UID
    session!.characterUIDs = session!.characterUIDs ? `${session!.characterUIDs},${entity.uid}` : entity.uid.toString();
  }
  // Update the session with the new entity information
  await sessionRepository.update(session!.id, session!);
  return res.status(200).json({ message: `${entityType} added successfully!` });
}

/*
In body:
1) add a monster:
{
  "entityType": "Monster",
  "entityInfo": {
    "authorUID": "masterPio",
    "name": "Orc",
    "maxHp": 30,
    "hp": 30,
    "armorClass": 13,
    "enchantments": [],
    "isReactionActivable": true,
    "speed": 30,
    "weapons": ["axe"],
    "effectsImmunities": []
    "skills": {[key:Skill]:number}
    
  }
}
2) add other entity:
{
  "entityType": "character",
  "entityInfo": {
    "uid": "character123"
  }
*/

/**
 * This function removes an entity from a session based on the sessionId and entityId 
 * provided in the request parameters. It updates the session by removing references to
 * the entity and deletes the entity from the appropriate repository.
 */
export async function deleteEntityService(req: IAugmentedRequest, res: Res) {
  const { sessionId, entityId } = req.params;

  const session = await sessionRepository.getById(sessionId);

  // Try to find the entity in entityTurn
  const entityTurnIndex = session!.entityTurns.findIndex(e => e.entityUID === entityId);
  session!.entityTurns.splice(entityTurnIndex, 1);

  // Remove the entity from the appropriate UID list
  await monsterRepository.delete(entityId);
  session!.monsters = session!.monsters?.filter(monster => monster.id !== entityId);
  session!.characterUIDs = session!.characterUIDs?.filter(uid => uid !== entityId);
  session!.npcUIDs = session!.npcUIDs?.filter(uid => uid !== entityId);

  // If it's a monster, also remove it from the monsters table
  const monsterIndex = session!.monsters.findIndex(m => m.id === parseInt(entityId));
  if (monsterIndex !== -1) {
    const [removedMonster] = session!.monsters.splice(monsterIndex, 1);
    await monsterRepository.delete(removedMonster.id);
  }

  // Update the session with the new entity information
  await sessionRepository.update(session!.id, session!);
  return res.status(200).json({ message: 'Entity removed successfully from session!' });
}

/**
 * This function retrieves detailed information about an entity within a session.
 * The entity is identified by the entityId provided in the request parameters.
 * It first checks if the entity is a monster, then if it is in the entityTurns list.
 * If the entity is not found, an error is returned.
 */
export async function getEntityInfoService(req: IAugmentedRequest, res: Res) {
  const { sessionId, entityId } = req.params;

  const session = await sessionRepository.getById(sessionId);

  // Try to find the entity in the monsters list
  const monster = session!.monsters.find(m => m.id === parseInt(entityId));
  if (monster) {
    // Return the monster details if found
    return res.status(200).json(monster);
  }

  // Try to find the entity in the entityTurns list
  const entityTurn = session!.entityTurns.find(e => e.entityUID === entityId);
  if (entityTurn) {
    // Return the entity turn details if found
    return res.status(200).json(entityTurn);
  }

  // Return an error if the entity is not found in either list
  errorFactory.genericError(`Entity "${entityId}" not found in session "${sessionId}"`).setStatus(res);
}


// TODO: rivedere alla luce di una nuova gestione dell'ordine dei turni
export async function updateEntityInfoService(req: IAugmentedRequest, res: Res) {
  const { sessionId, entityId } = req.params;
  const entityInfo = req.body;

  const session = await sessionRepository.getById(sessionId);

  // If posX or posY
  // Try to find the entity in entityTurn
  const entityTurnIndex = session!.entityTurns.findIndex(e => e.entityUID === entityId);
  if (entityTurnIndex !== -1) {
    const entityTurn = session!.entityTurns[entityTurnIndex];

    // Update entity turn information
    Object.assign(entityTurn, entityInfo);
    await sessionRepository.update(session!.id, session!);
    return res.status(200).json({ message: 'Entity info updated successfully!' });
  }


  // Assuming monster skill are not part of the request body
  // Try to find the entity in monsters
  const monsterIndex = session!.monsters.findIndex(m => m.id === parseInt(entityId));
  if (monsterIndex !== -1) {
    const monster = session!.monsters[monsterIndex];

    // Update monster information
    Object.assign(monster, entityInfo);
    await monsterRepository.update(monster.id, monster);
    return res.status(200).json({ message: 'Monster info updated successfully!' });
  }

  // Try to find the entity in characterUIDs or npcUIDs
  const entityTurnEntity = session!.entityTurns.find(e => e.entityUID === entityId);
  if (entityTurnEntity) {
    // Update character or npc entity information
    Object.assign(entityTurnEntity, entityInfo);
    await sessionRepository.update(session!.id, session!);
    return res.status(200).json({ message: 'Character/NPC info updated successfully!' });
  }
}
/* sample body for update:
{
  "_name": "Updated Name",
  "_maxHp": 50,
  "_hp": 40,
  "armorClass": 18,
  "enchantments": ["Enchantment 1", "Enchantment 2"],
  "isReactionActivable": true,
  "speed": 30,
  "weapons": ["Weapon 1", "Weapon 2"],
  "effects": [
    {"name": "Effect 1", "description": "Description of Effect 1"},
    {"name": "Effect 2", "description": "Description of Effect 2"}
  ]
}
*/