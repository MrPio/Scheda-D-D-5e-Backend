import { IAugmentedRequest } from '../api';
import { Response as Res } from 'express';
import { RepositoryFactory } from '../repository/repository_factory';
import { Error400Factory } from '../error/error_factory';

const errorFactory = new Error400Factory();
const repositoryFactory = new RepositoryFactory();
const sessionRepository = repositoryFactory.sessionRepository();
const monsterRepository = repositoryFactory.monsterRepository();

export async function addEntityService(req: IAugmentedRequest, res: Res) {
  const { sessionId } = req.params;
  const { entityType, entityInfo } = req.body;

  const session = await sessionRepository.getById(sessionId);

  let entity;
  if (entityType === 'monster') {
    entity = await monsterRepository.create({ ...entityInfo, sessionId: sessionId });
    session?.monsters.push(entity);
  } else if (entityType === 'npc') {
    entity = { uid: entityInfo.uid }; // Assuming other entities only need UID
    session!.npcUIDs = session!.npcUIDs ? `${session!.npcUIDs},${entity.uid}` : entity.uid.toString();
  } else {
    entity = { uid: entityInfo.uid }; // Assuming other entities only need UID
    session!.characterUIDs = session!.characterUIDs ? `${session!.characterUIDs},${entity.uid}` : entity.uid.toString();
  }

  await sessionRepository.update(session!.id, session!);
  return res.status(200).json({ message: `${entityType} added to session` });
}

/*
In body:
1) add a monster:
{
  "entityType": "monster",
  "entityInfo": {
    "authorUID": "masterPio",
    "_name": "Orc",
    "_maxHp": 30,
    "_hp": 30,
    "armorClass": 13,
    "enchantments": [],
    "isReactionActivable": true,
    "speed": 30,
    "weapons": ["axe"],
    "effects": []
  }
}
2) add other entity:
{
  "entityType": "character",
  "entityInfo": {
    "uid": "character123"
  }
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

  await sessionRepository.update(session!.id, session!);
  return res.status(200).json({ message: 'Entity removed from session' });
}

//export async function getMonsterInfoService(req: AugmentedRequest, res: Res) {
// TODO
//}

export async function getEntityInfoService(req: IAugmentedRequest, res: Res) {
  const { sessionId, entityId } = req.params;

  const session = await sessionRepository.getById(sessionId);

  const monster = session!.monsters.find(m => m.id === parseInt(entityId));
  if (monster) {
    return res.status(200).json(monster);
  }

  const entityTurn = session!.entityTurns.find(e => e.entityUID === entityId);
  if (entityTurn) {
    return res.status(200).json(entityTurn);
  }
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
    return res.status(200).json({ message: 'Entity info updated successfully' });
  }


  // Assuming monster skill are not part of the request body
  // Try to find the entity in monsters
  const monsterIndex = session!.monsters.findIndex(m => m.id === parseInt(entityId));
  if (monsterIndex !== -1) {
    const monster = session!.monsters[monsterIndex];

    // Update monster information
    Object.assign(monster, entityInfo);
    await monsterRepository.update(monster.id, monster);
    return res.status(200).json({ message: 'Monster info updated successfully' });
  }

  // TODO: check
  // Try to find the entity in characterUIDs or npcUIDs
  const entityTurnEntity = session!.entityTurns.find(e => e.entityUID === entityId);
  if (entityTurnEntity) {
    // Update character or npc entity information
    Object.assign(entityTurnEntity, entityInfo);
    await sessionRepository.update(session!.id, session!);
    return res.status(200).json({ message: 'Character/NPC info updated successfully' });
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