import { Response as Res } from 'express';
import { RepositoryFactory } from '../repository/repository_factory';
import { IAugmentedRequest } from '../interface/augmented_request';
import { EntityType } from '../model/entity';
import { MonsterSkill } from '../model/monster_skill';
import { Effect } from '../model/effect';
import { deleteEntity, findEntity, updateEntity } from './utility/model_queries';
import { Monster } from '../model/monster';
import { randomInt } from 'crypto';
import { EntityTurn } from '../model/entity_turn';
import { ActionType } from '../model/history_message';
import { httpPost } from './utility/axios_requests';

const repositoryFactory = new RepositoryFactory();
const sessionRepository = repositoryFactory.sessionRepository();
const characterRepository = repositoryFactory.characterRepository();
const monsterRepository = repositoryFactory.monsterRepository();
const monsterSkillRepository = repositoryFactory.monsterSkillRepository();
const entityTurnRepository = repositoryFactory.entityTurnRepository();

/**
 * Adds an entity to a session based on the sessionId provided in the request parameters.
 * The entity type and details are specified in the request body.
 * Depending on the entity type, it updates the session accordingly.
 */
export async function addEntityService(req: IAugmentedRequest, res: Res) {
  const body: {
    entityType: EntityType,
    entityInfo: {
      authorUID?: string,
      name?: string,
      hp?: number,
      maxHp?: number,
      armorClass?: number,
      isReactionActivable?: boolean,
      speed?: number,
      skills?: { [key: string]: number },
      enchantments?: string[],
      weapons?: string[],
      effectImmunities?: Effect[],
      effects?: Effect[],
      uid?: string
    }
  } = req.body;
  let entityId;
  if (body.entityType === EntityType.monster) {
    const monster = await monsterRepository.create({
      authorUID: body.entityInfo.authorUID!,
      _name: body.entityInfo.name!,
      _hp: body.entityInfo.hp!,
      _maxHp: body.entityInfo.maxHp!,
      armorClass: body.entityInfo.armorClass!,
      isReactionActivable: body.entityInfo.isReactionActivable!,
      speed: body.entityInfo.speed!,
      enchantments: body.entityInfo.enchantments!,
      weapons: body.entityInfo.weapons!,
      effectImmunities: body.entityInfo.effectImmunities!,
      effects: body.entityInfo.effects!,
      sessionId: Number.parseInt(req.sessionId!),
    } as Monster);
    entityId = monster.id;
    for (const skill of Object.entries(body.entityInfo.skills!))
      monsterSkillRepository.create({ skill: skill[0], value: skill[1], monsterId: monster.id } as MonsterSkill);
  } else if (body.entityType === EntityType.npc) {
    entityId = body.entityInfo.uid!;
    req.session!.npcUIDs = (req.session!.npcUIDs ?? []).concat(body.entityInfo.uid!);
    sessionRepository.update(req.sessionId!, { npcUIDs: req.session!.npcUIDs });
  } else if (body.entityType === EntityType.character) {
    entityId = body.entityInfo.uid!;
    req.session!.characterUIDs = (req.session!.characterUIDs ?? []).concat(body.entityInfo.uid!);
    sessionRepository.update(req.sessionId!, { characterUIDs: req.session!.characterUIDs });
  }
  entityTurnRepository.create({
    entityUID: entityId,
    turnIndex: req.session!.sortedTurns[req.session!.entityTurns.length - 1].turnIndex + 1,
    posX: randomInt(req.session!.mapSize!.width),
    posY: randomInt(req.session!.mapSize!.height),
    sessionId: req.session!.id,
  } as EntityTurn);
  return res.status(200).json({ message: `${body.entityType} added successfully!` });
}

/**
 * Removes an entity from a session based on the sessionId and entityId 
 * provided in the request parameters. It updates the session by removing references to
 * the entity and deletes the entity from the appropriate repository.
 */
export async function deleteEntityService(req: IAugmentedRequest, res: Res) {
  deleteEntity(req.session!, req.entityId!);
  return res.status(200).json({ message: `${req.entity!._name} removed successfully from session!` });
}

/**
 * Retrieves information about an entity within a session.
 * The entity is identified by the entityId provided in the request parameters.
 * It first checks if the entity is a monster, then if it is in the entityTurns list.
 * If the entity is not found, an error is returned.
 */
export async function getEntityInfoService(req: IAugmentedRequest, res: Res) {
  return res.status(200).json(req.entity);
}

// Updates information about an entity within a session.
export async function updateEntityInfoService(req: IAugmentedRequest, res: Res) {
  updateEntity(req.session!, req.entityId!, {
    _hp: req.body.hp ?? req.entity?._hp,
    armorClass: req.body.armorClass ?? req.entity?.armorClass,
    speed: req.body.speed ?? req.entity?.speed,
    effects: req.body.effects ?? req.entity?.effects,
  });
  const entity = await findEntity(req.session!, req.entityId!);
  if (req.body.slots && entity?.entityType == EntityType.character)
    characterRepository.update(req.entityId!, { slots: req.body.slots });

  // Check if the entity has died
  if (req.body.hp <= 0) {
    await entityTurnRepository.delete(req.session?.entityTurns.find(it => it.entityUID === req.entityId!)?.id);
    httpPost(`/sessions/${req.sessionId!}/broadcast`, { actionType: ActionType.died, message: `${entity?.entity._name} has died!` });
  }
  res.json({ messag: `${req.entity!._name} updated successfully!` });
}