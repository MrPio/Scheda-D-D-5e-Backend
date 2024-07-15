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

/**
 * interface PizzaSizeSpec {
    key: number,
    value: number
}
function getPizzaSizeSpec(pizzaSize: PizzaSize): PizzaSizeSpec {
    switch (pizzaSize) {
        case PizzaSize.small:
            return {key:0, value: 25};
        case PizzaSize.medium:
            return {key:0, value: 35};
        case PizzaSize.large:
            return {key:0, value: 50};
    }
}
 */