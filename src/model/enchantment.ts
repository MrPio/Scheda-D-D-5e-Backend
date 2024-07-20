import { DocumentData } from 'firebase-admin/firestore';
import { JSONSerializable } from '../db/firestore';

/**
 * Enum representing categories of enchantments.
 * Each category indicates the primary type of effect an enchantment has.
 */
export enum EnchantmentCategory {
  damage = 'attacco',
  savingThrow = 'tiroSalvezza',
  descriptive = 'descrittivo',
}

/**
 * Enum representing the levels of enchantments.
 * Levels range from 0 to 9, indicating the power or complexity of the enchantment.
 */
export enum Level {
  level0 = 0,
  level1 = 1,
  level2 = 2,
  level3 = 3,
  level4 = 4,
  level5 = 5,
  level6 = 6,
  level7 = 7,
  level8 = 8,
  level9 = 9,
}

/**
 * Enum representing different types of ranges for enchantments.
 * Each type describes how the enchantment's range is measured or applied.
 */
enum RangeType {
  point = 'punto',
  ray = 'raggio',
  hemisphere = 'semisfera',
  line = 'linea',
  cone = 'cono',
  cube = 'cubo',
}

// A mapping of range descriptions to their numerical values in meters or kilometers.
const rangeConversion: { [key: string]: number } = {
  'metri1_5': 1.5,
  'metri3': 3,
  'metri4_5': 4.5,
  'metri9': 9,
  'metri18': 18,
  'metri27': 27,
  'metri30': 30,
  'metri36': 36,
  'metri45': 45,
  'metri90': 90,
  'metri150': 150,
  'km7_5': 7_500,
  'km750': 750_000,
};

/**
 * Represents an enchantment with various attributes such as name, level, range, and category.
 * Extends from `JSONSerializable` to support JSON serialization and deserialization.
 */
export default class Enchantment extends JSONSerializable {

  /**
   * Constructs an instance of the `Enchantment` class.
   * @param name The name of the enchantment.
   * @param level The level of the enchantment, indicating its power.
   * @param range The range of the enchantment, measured using the defined conversion.
   * @param rangeType The type of range for the enchantment.
   * @param isCharmer Indicates if the enchantment can charm.
   * @param isReaction Indicates if the enchantment requires a reaction.
   * @param category The category of the enchantment.
   */
  constructor(
    public name: string,
    public level: Level,
    public range: number,
    public rangeType: RangeType,
    public isCharmer: boolean,
    public isReaction: boolean,
    public category: EnchantmentCategory,
  ) { super(); }

  /**
   * Creates an instance of `Enchantment` from a JSON object.
   * @param json The JSON object containing enchantment data.
   * @returns A new instance of `Enchantment`.
   */
  static fromJSON(json: DocumentData): Enchantment {
    return new Enchantment(
      json.name,
      json.level as Level,
      rangeConversion[json.range] ?? 0,
      json.rangeType as RangeType,
      json.isCharmer,
      json.isReaction == 'reazione',
      json.damage,
    );
  }
}