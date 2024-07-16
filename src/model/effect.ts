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
  effect in [Effect.blinded, Effect.petrified, Effect.unconscious];

export const cannotMove = (effect: Effect): boolean =>
  effect in [Effect.restrained, Effect.paralyzed, Effect.petrified, Effect.unconscious, Effect.grappled, Effect.stunned];

export const cannotAttack = (effect: Effect): boolean =>
  effect in [Effect.incapacitated, Effect.paralyzed, Effect.petrified, Effect.unconscious, Effect.prone, Effect.stunned];

export const cannotUseReaction = (effect: Effect): boolean =>
  effect in [Effect.incapacitated, Effect.paralyzed, Effect.petrified, Effect.unconscious, Effect.prone, Effect.stunned];

export const cannotCastEnchantment = (effect: Effect): boolean =>
  effect in [Effect.incapacitated, Effect.paralyzed, Effect.petrified, Effect.unconscious, Effect.prone, Effect.stunned];

