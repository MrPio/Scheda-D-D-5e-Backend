/**
 * The different types of attack used in the sessions.
 * Each member corresponds to a specific type of attack useful for checks and to determine the mandatory parameters in the attack phase.
 */
export enum AttackType {
  melee = 'melee',
  damageEnchantment = 'damageEnchantment',
  savingThrowEnchantment = 'savingThrowEnchantment', 
  descriptiveEnchantment = 'descriptiveEnchantment',
}