import { CompetitorBusiness, EntrepreneurProfile } from '../types';

export const DEFAULT_PROFILE: EntrepreneurProfile = {
  pincode: '522002',
  villageTown: 'Guntur Rural',
  district: 'Guntur',
  state: 'Andhra Pradesh',
  category: 'agro-repair',
  availableCapital: 200000,
  gender: 'MALE',
  socialCategory: 'OBC',
  isRural: true,
  age: 29
};

export const INITIAL_COMPETITORS: CompetitorBusiness[] = [
  {
    id: 'comp-1',
    name: 'Sri Lakshmi Agro Machinery & Spares',
    category: 'agro-repair',
    source: 'UDYAM',
    confidenceScore: 0.95,
    verificationStatus: 'VERIFIED',
    distanceKm: 1.2,
    lat: 16.3082,
    lng: 80.4325,
    address: 'Near Old Bus Stand, Main Road, Guntur Rural'
  },
  {
    id: 'comp-2',
    name: 'Balaji Tractor & Pump Repair Center',
    category: 'agro-repair',
    source: 'OPENSTREETMAP',
    confidenceScore: 0.85,
    verificationStatus: 'VERIFIED',
    distanceKm: 2.1,
    lat: 16.3140,
    lng: 80.4410,
    address: 'Bypass Road Crossing, Guntur Rural'
  },
  {
    id: 'comp-3',
    name: 'Ramu Welding & Motor Rewinding (Informal Stall)',
    category: 'agro-repair',
    source: 'COMMUNITY',
    confidenceScore: 0.65,
    verificationStatus: 'UNVERIFIED',
    distanceKm: 0.9,
    lat: 16.3020,
    lng: 80.4350,
    address: 'Opposite Village Panchayat Office, Guntur Rural',
    reportedDate: '2026-08-14',
    upvotes: 3
  }
];

export const CATEGORY_LABELS: Record<string, string> = {
  'agro-repair': 'Agro-Machinery & Pump Repair',
  'grocery': 'Kirana & Daily Provisions Store',
  'tailoring': 'Garments & Tailoring Center',
  'dairy': 'Dairy Farm & Milk Chilling Unit',
  'food-processing': 'Grain / Spice Processing Mill',
  'bakery': 'Rural Bakery & Confectionery',
  'solar-repair': 'Solar Pump & Electrical Repair'
};
