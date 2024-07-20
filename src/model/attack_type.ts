/**
 * Enum representing different types of attack used in the sessions.
 * Each member corresponds to a specific type of attack useful for checks and to determine the mandatory parameters in the attack phase.
 */
export enum AttackType {
  attack = 'attack',
  damageEnchantment = 'damageEnchantment',
  savingThrowEnchantment = 'savingThrowEnchantment', 
  descriptiveEnchantment = 'descriptiveEnchantment',
}