import { CompetitorBusiness, EntrepreneurProfile } from '../types';

export const DEFAULT_PROFILE: EntrepreneurProfile = {
  pincode: '',
  villageTown: '',
  district: '',
  state: '',
  category: 'agro-repair',
  availableCapital: 0,
  gender: 'MALE',
  socialCategory: 'GENERAL',
  isRural: true,
  age: 25
};

export const INITIAL_COMPETITORS: CompetitorBusiness[] = [];

export const CATEGORY_LABELS: Record<string, string> = {
  'agro-repair': 'Agro-Machinery & Pump Repair',
  'grocery': 'Kirana & Daily Provisions Store',
  'tailoring': 'Garments & Tailoring Center',
  'dairy': 'Dairy Farm & Milk Chilling Unit',
  'food-processing': 'Grain / Spice Processing Mill',
  'bakery': 'Rural Bakery & Confectionery',
  'solar-repair': 'Solar Pump & Electrical Repair'
};
