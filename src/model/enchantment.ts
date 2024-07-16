import { DocumentData } from 'firebase-admin/firestore';
import { JSONSerializable } from '../db/firestore';

export enum EnchantmentCategory {
  damage,
  savingThrow,
  descriptive,
}

enum RangeType {
  punto,
  raggio,
  semisfera,
  linea,
  cono,
  cubo,
}

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

export default class Enchantment extends JSONSerializable {

  constructor(
    public name: string,
    public range: number,
    public rangeType: RangeType,
    public isCharmer: boolean,
    public isReaction: boolean,
    public category: EnchantmentCategory,
  ) { super(); }

  static fromJSON(json: DocumentData): Enchantment {
    return new Enchantment(
      json.name,
      rangeConversion[json.range] ?? 0,
      json.rangeType as RangeType,
      json.isCharmer,
      json.isReaction == 'reazione',
      json.damage,
    );
  }
}