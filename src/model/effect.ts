// The different effects an entity can have. Most of these restrict the actions of the entity.
export enum Effect {
  blinded = 'cieco',
  charmed = 'affascinato',
  deafened = '•	assordato',
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

