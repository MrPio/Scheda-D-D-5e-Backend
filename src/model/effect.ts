// The different effects an entity can have. Most of these restrict the actions of the entity.
export enum Effect {
  blinded,
  charmed,
  deafened,
  frightened,
  grappled,
  incapacitated,
  invisible,
  none,
  paralyzed,
  petrified,
  poisoned,
  prone,
  restrained,
  stunned,
  unconscious,
}

export const cannotSee = (effect: Effect): boolean =>
  effect in [];

export const cannotMove = (effect: Effect): boolean =>
  effect in [Effect.grappled, Effect.paralyzed, Effect.petrified, Effect.unconscious, Effect.stunned];

export const cannotAttack = (effect: Effect): boolean =>
  effect in [];

export const cannotUseReaction = (effect: Effect): boolean =>
  effect in [];

export const cannotCastEnchantment = (effect: Effect): boolean =>
  effect in [];

