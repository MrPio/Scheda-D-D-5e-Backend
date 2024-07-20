/**
 * Enum representing various status effects that can influence a character or entity in a game.
 * Each effect represents a specific condition or debuff applied to a character.
 */
export enum Effect {
  blinded = 'cieco',
  charmed = 'affascinato',
  deafened = 'assordato',
  frightened = 'spaventato',
  grappled = 'afferrato',
  incapacitated = 'incapacitato',
  invisible = 'invisibile',
  paralyzed = 'paralizzato',
  petrified = 'pietrificato',
  poisoned = 'avvelenato',
  prone = 'prono',
  restrained = 'trattenuto',
  stunned = 'stordito',
  unconscious = 'privoDiSensi',
}

/**
 * Determines if a character with the given effect cannot see.
 * @param effect The effect applied to the character.
 * @returns True if the effect impairs vision, otherwise false.
 */
export const cannotSee = (effect: Effect): boolean =>
  effect in [Effect.blinded, Effect.petrified, Effect.unconscious];
/**
 * 
 * Determines if a character with the given effect cannot move.
 * @param effect The effect applied to the character.
 * @returns True if the effect impairs movement, otherwise false.
 */
export const cannotMove = (effect: Effect): boolean =>
  effect in [Effect.restrained, Effect.paralyzed, Effect.petrified, Effect.unconscious, Effect.grappled, Effect.stunned];

/**
 * Determines if a character with the given effect cannot attack.
 * @param effect The effect applied to the character.
 * @returns True if the effect impairs attacking ability, otherwise false.
 */
export const cannotAttack = (effect: Effect): boolean =>
  effect in [Effect.incapacitated, Effect.paralyzed, Effect.petrified, Effect.unconscious, Effect.prone, Effect.stunned];

/**
 * Determines if a character with the given effect cannot use reactions.
 * @param effect The effect applied to the character.
 * @returns True if the effect prevents the use of reactions, otherwise false.
 */
export const cannotUseReaction = (effect: Effect): boolean =>
  effect in [Effect.incapacitated, Effect.paralyzed, Effect.petrified, Effect.unconscious, Effect.prone, Effect.stunned];

/**
 * Determines if a character with the given effect cannot cast enchantments.
 * @param effect The effect applied to the character.
 * @returns True if the effect prevents casting enchantments, otherwise false.
 */
export const cannotCastEnchantment = (effect: Effect): boolean =>
  effect in [Effect.incapacitated, Effect.paralyzed, Effect.petrified, Effect.unconscious, Effect.prone, Effect.stunned];

