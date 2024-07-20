import { Response, NextFunction } from 'express';
import { Effect } from '../model/effect';
import { RepositoryFactory } from '../repository/repository_factory';
import { Error400Factory } from '../error/error_factory';
import { EntityType } from '../model/entity';
import { IAugmentedRequest } from '../interface/augmented_request';
import Character from '../model/character';

const error400Factory: Error400Factory = new Error400Factory();
const enchantmentRepository = new RepositoryFactory().enchantmentRepository();
const characterRepository = new RepositoryFactory().characterRepository();
const npcRepository = new RepositoryFactory().npcRepository();

/**
 * Check the validity of adding a new entity to a session
 * @precondition `checkSessionExists`
 */
export const checkAddEntity = async (req: IAugmentedRequest, res: Response, next: NextFunction) => {
  const body: { entityType: EntityType, entityInfo: { uid?: string, maxHp?: number, armorClass?: number, enchantments?: string[], weapons?: string[], effectImmunities?: Effect[], speed?: number, skills?: { [skill: string]: number } } } = req.body;

  // If the entity is a Monster, check its properties values.
  if (body.entityType === EntityType.monster) {
    if (body.entityInfo.maxHp! <= 0)
      return error400Factory.invalidNumber('maxHp', 'a positive integer').setStatus(res);
    if (body.entityInfo.armorClass! <= 0)
      return error400Factory.invalidNumber('armorClass', 'a positive integer').setStatus(res);
    if (body.entityInfo.speed! % 1.5 !== 0)
      return error400Factory.invalidNumber('speed', 'a positive number divisible by 1.5').setStatus(res);
    if (Object.values(body.entityInfo.skills!).some(it => it < 1 || it > 30))
      return error400Factory.invalidNumber('skills', 'an integer between 1 and 30').setStatus(res);

    // Verify the name of the enchantments
    for (const enchantmentId of body.entityInfo.enchantments ?? [])
      if (!await enchantmentRepository.getById(enchantmentId))
        return error400Factory.enchantmentNotFound(enchantmentId).setStatus(res);
  } else {

    // Check that the character or npc exists.
    if (!await (body.entityType === EntityType.character ? characterRepository : npcRepository).getById(body.entityInfo.uid!))
      return (body.entityType === EntityType.character ? error400Factory.characterNotFound(body.entityInfo.uid!) : error400Factory.npcNotFound(body.entityInfo.uid!)).setStatus(res);

    // Check that the entity is not already part of the session
    if ((body.entityType === EntityType.character ? req.session!.characterUIDs : req.session!.npcUIDs)?.includes(body.entityInfo.uid!))
      return error400Factory.genericError(`"${body.entityInfo.uid!}" is already in the battle!`).setStatus(res);
  }
  next();
};

/**
 * Checks if an entity update is valid
 * @precondition `checkSessionExists`
 * @precondition `checkEntityExistsInSession`
 */
//TODO: MrPio check turn
export const checkUpdateEntity = async (req: IAugmentedRequest, res: Response, next: NextFunction) => {
  const body: { hp?: number, armorClass?: number, speed?: number, effects?: Effect[], slots?: { [key: number]: number } } = req.body;

  // Check for any modification
  if (Object.values(body).every(it => !it))
    return error400Factory.genericError('You need to change at least one parameter.!').setStatus(res);

  // Check params values
  if ((body.speed ?? 0) % 1.5 !== 0)
    return error400Factory.invalidNumber('speed', 'a positive number divisible by 1.5').setStatus(res);
  if ((body.armorClass ?? 1) <= 0)
    return error400Factory.invalidNumber('armorClass', 'a positive integer').setStatus(res);

  // Check if the new value for the slot enchantment level does not exceed the maxSlots 
  if (req.entityType === EntityType.character)
    for (let i = 0; i <= 8; i++)
      if (body.slots![i] ?? 0 + (req.entity! as Character).slots[i] ?? 0 > (req.entity! as Character).maxSlots[i])
        return error400Factory.genericError(`The new value of level "${i}" slots exceeds your maximum number of slots for that level!`).setStatus(res);
  next();
};