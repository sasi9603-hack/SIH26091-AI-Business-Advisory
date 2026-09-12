import { BusinessCategory, EntrepreneurProfile } from '../types';

export interface MarketFeasibilityData {
  feasibilityScore: number;
  feasibilityVerdict: 'HIGH VIABILITY' | 'MODERATE VIABILITY' | 'NEEDS CAUTION';
  catchmentPopulation: number;
  dailyFootfallRange: { min: number; max: number };
  saturationIndexPct: number;
  saturationRating: 'Low' | 'Moderate' | 'High';
  opportunityGapLabel: string;
  nearestHub: { name: string; distanceKm: number };
  customerSegments: { label: string; pct: number; description: string }[];
  peakBusinessHours: { window: string; trafficLevel: 'High' | 'Peak' | 'Normal'; note: string }[];
  seasonalTrends: { season: string; months: string; impactPct: number; trend: 'peak' | 'normal' | 'lean'; description: string }[];
  logistics: {
    primarySupplier: string;
    procurementFrequency: string;
    avgTripCost: string;
    turnoverDays: number;
  };
  actionableInsights: string[];
}

export function generateMarketFeasibility(profile: EntrepreneurProfile): MarketFeasibilityData {
  const cat = profile.category;

  switch (cat) {
    case 'agro-repair':
      return {
        feasibilityScore: 88,
        feasibilityVerdict: 'HIGH VIABILITY',
        catchmentPopulation: 16500,
        dailyFootfallRange: { min: 35, max: 55 },
        saturationIndexPct: 24,
        saturationRating: 'Low',
        opportunityGapLabel: 'Underserved: Farmers travel 12km+ for pump & tractor repairs',
        nearestHub: { name: 'Regional Agri-Machinery Mandi', distanceKm: 4.8 },
        customerSegments: [
          { label: 'Paddy & Cotton Cultivators', pct: 55, description: 'Motor rewinding, tiller maintenance, sprayer servicing' },
          { label: 'Commercial Rural Transporters', pct: 25, description: 'Tractor trailer tyre & hydraulic repairs' },
          { label: 'Smallholder Domestic Users', pct: 20, description: 'Domestic water pumps and electric motors' }
        ],
        peakBusinessHours: [
          { window: '06:30 AM - 09:30 AM', trafficLevel: 'Peak', note: 'Pre-field departure urgent equipment checks' },
          { window: '01:00 PM - 03:30 PM', trafficLevel: 'Normal', note: 'Bench repairs and rewinding workshop work' },
          { window: '05:30 PM - 08:00 PM', trafficLevel: 'High', note: 'Drop-off of repaired parts after field return' }
        ],
        seasonalTrends: [
          { season: 'Kharif Sowing Season', months: 'Jun - Aug', impactPct: 40, trend: 'peak', description: 'Surge in pump motor rewinding & tractor disc servicing' },
          { season: 'Rabi Harvest Season', months: 'Feb - Apr', impactPct: 30, trend: 'peak', description: 'Harvester breakdown and threshing blade sharpening' },
          { season: 'Monsoon Flooding Months', months: 'Jul - Sep', impactPct: -15, trend: 'lean', description: 'Submerged fields, slower machinery mobility' }
        ],
        logistics: {
          primarySupplier: 'District Agro-Spare Parts Wholesale Hub',
          procurementFrequency: 'Bi-weekly replenishment',
          avgTripCost: '?220 per bus/auto run',
          turnoverDays: 14
        },
        actionableInsights: [
          'Position workshop adjacent to the main rural link road leading to agricultural fields.',
          'Stock essential fast-moving spares (capacitor coils, copper winding wire, v-belts) to offer same-day turnaround.',
          'Introduce mobile doorstep breakdown assistance within a 5 km radius during peak sowing months.'
        ]
      };

    case 'grocery':
      return {
        feasibilityScore: 84,
        feasibilityVerdict: 'HIGH VIABILITY',
        catchmentPopulation: 14200,
        dailyFootfallRange: { min: 80, max: 130 },
        saturationIndexPct: 42,
        saturationRating: 'Moderate',
        opportunityGapLabel: 'Solid Steady Demand: High demand for branded staples & dairy packaged goods',
        nearestHub: { name: 'Sub-Divisional FMCG Wholesale Market', distanceKm: 3.5 },
        customerSegments: [
          { label: 'Rural Residential Households', pct: 60, description: 'Daily pulses, cooking oil, spices, and soaps' },
          { label: 'Daily Wage Laborers', pct: 25, description: 'Evening sachet purchases and instant staples' },
          { label: 'Roadside Travellers & Commuters', pct: 15, description: 'Snacks, packaged beverages, and confectionaries' }
        ],
        peakBusinessHours: [
          { window: '07:00 AM - 10:00 AM', trafficLevel: 'High', note: 'Morning tea, milk, and fresh pantry essentials' },
          { window: '12:00 PM - 03:00 PM', trafficLevel: 'Normal', note: 'Midday lean customer flow' },
          { window: '05:30 PM - 09:00 PM', trafficLevel: 'Peak', note: 'Evening household grocery shopping rush' }
        ],
        seasonalTrends: [
          { season: 'Diwali & Pongal/Sankranti', months: 'Oct - Jan', impactPct: 45, trend: 'peak', description: 'Bulk provisions, sweets, oils, and celebratory items' },
          { season: 'Wedding & Muhurtam Season', months: 'Feb - May', impactPct: 25, trend: 'peak', description: 'Catering bulk orders and gift pack groceries' },
          { season: 'Mid-Monsoon Damp Months', months: 'Jul - Aug', impactPct: -10, trend: 'lean', description: 'Lower footfall due to heavy rainfall' }
        ],
        logistics: {
          primarySupplier: 'Town Wholesale Kirana Merchant Association',
          procurementFrequency: 'Weekly scheduled deliveries',
          avgTripCost: '?150 delivery share',
          turnoverDays: 8
        },
        actionableInsights: [
          'Place high-margin packaged commodities and branded local items at eye level.',
          'Offer QR / UPI digital payments to attract youth and migrant remittance spenders.',
          'Stock small FMCG sachet packs (?5–?20) alongside 5kg/10kg bulk bags to capture all income segments.'
        ]
      };

    case 'dairy':
      return {
        feasibilityScore: 90,
        feasibilityVerdict: 'HIGH VIABILITY',
        catchmentPopulation: 18000,
        dailyFootfallRange: { min: 70, max: 110 },
        saturationIndexPct: 20,
        saturationRating: 'Low',
        opportunityGapLabel: 'High Local Deficit: Quality fresh cow/buffalo milk collection in village',
        nearestHub: { name: 'District Co-operative Milk Chilling Center', distanceKm: 6.2 },
        customerSegments: [
          { label: 'Local Village Households', pct: 50, description: 'Fresh morning and evening unadulterated milk' },
          { label: 'Tea Stalls & Sweet Shops', pct: 30, description: 'High-fat buffalo milk on commercial daily contracts' },
          { label: 'Cooperative Dairy Procurement', pct: 20, description: 'Surplus milk sold to dairy union with fat-testing bonus' }
        ],
        peakBusinessHours: [
          { window: '05:30 AM - 08:30 AM', trafficLevel: 'Peak', note: 'Morning milking, testing, and distribution' },
          { window: '11:00 AM - 02:00 PM', trafficLevel: 'Normal', note: 'Curd / butter / ghee processing' },
          { window: '05:00 PM - 07:30 PM', trafficLevel: 'Peak', note: 'Evening milk distribution cycle' }
        ],
        seasonalTrends: [
          { season: 'Winter Flush Season', months: 'Nov - Feb', impactPct: 35, trend: 'peak', description: 'Maximum milk yield and highest consumer demand for ghee' },
          { season: 'Summer Lean Period', months: 'Apr - Jun', impactPct: -20, trend: 'lean', description: 'Fodder scarcity reduces lactation yields by 15-25%' },
          { season: 'Festive Season', months: 'Aug - Oct', impactPct: 25, trend: 'peak', description: 'Pooja and festival dairy demand surge' }
        ],
        logistics: {
          primarySupplier: 'Local Fodder & Cattle Feed Distribution Point',
          procurementFrequency: 'Weekly cattle feed bags',
          avgTripCost: '?120 per trip',
          turnoverDays: 3
        },
        actionableInsights: [
          'Invest in a certified digital milk fat & SNF testing analyzer to build farmer trust.',
          'Convert evening surplus milk into value-added curd, paneer, and ghee for higher margins (30%+).',
          'Tie up with 3 local tea stalls on an assured daily supply contract for recurring cash flow.'
        ]
      };

    case 'tailoring':
      return {
        feasibilityScore: 82,
        feasibilityVerdict: 'HIGH VIABILITY',
        catchmentPopulation: 11500,
        dailyFootfallRange: { min: 15, max: 30 },
        saturationIndexPct: 35,
        saturationRating: 'Moderate',
        opportunityGapLabel: 'High Demand: Custom stitching, school uniforms, and festival dressmaking',
        nearestHub: { name: 'City Textile & Haberdashery Mandi', distanceKm: 7.5 },
        customerSegments: [
          { label: 'Women & Girls (Ethnic/Blouse)', pct: 55, description: 'Designer blouses, salwar suits, and sarees edging' },
          { label: 'School Uniform Contracts', pct: 25, description: 'Bulk stitching for 2 nearby government/private schools' },
          { label: 'Men Everyday Alterations', pct: 20, description: 'Trouser hemming, shirt tailoring, and repairs' }
        ],
        peakBusinessHours: [
          { window: '10:00 AM - 01:00 PM', trafficLevel: 'Normal', note: 'Measurements and fabric consultation' },
          { window: '01:30 PM - 05:00 PM', trafficLevel: 'Normal', note: 'Uninterrupted machine cutting and assembly' },
          { window: '05:30 PM - 08:30 PM', trafficLevel: 'High', note: 'Customer fitting trials and order deliveries' }
        ],
        seasonalTrends: [
          { season: 'School Reopening', months: 'Jun - Jul', impactPct: 60, trend: 'peak', description: 'School uniform contracts create 2 months full capacity' },
          { season: 'Festival & Wedding Surge', months: 'Oct - Jan', impactPct: 40, trend: 'peak', description: 'High-value blouse, bridal, and festive wear stitching' },
          { season: 'Post-Festival Slump', months: 'Feb - Mar', impactPct: -20, trend: 'lean', description: 'Fewer festive occasions, regular alterations only' }
        ],
        logistics: {
          primarySupplier: 'Textile Market Spool & Lining Distributors',
          procurementFrequency: 'Monthly bulk thread & lining purchase',
          avgTripCost: '?140',
          turnoverDays: 20
        },
        actionableInsights: [
          'Upgrade to a motorized electric sewing machine and interlocking (overlock) unit for speed.',
          'Secure school uniform stitching orders in April-May before school resumes in June.',
          'Maintain transparent delivery date tokens to eliminate order handover disputes.'
        ]
      };

    default:
      return {
        feasibilityScore: 85,
        feasibilityVerdict: 'HIGH VIABILITY',
        catchmentPopulation: 13800,
        dailyFootfallRange: { min: 25, max: 60 },
        saturationIndexPct: 28,
        saturationRating: 'Low',
        opportunityGapLabel: 'Unmet Community Demand: High potential for organized quality local micro-service',
        nearestHub: { name: 'Tehsil Commercial Market Hub', distanceKm: 5.0 },
        customerSegments: [
          { label: 'Core Village Residents', pct: 60, description: 'Primary consumers for regular local products and services' },
          { label: 'Nearby Hamlets & Wards', pct: 25, description: 'Commuters visiting the main village market' },
          { label: 'Local Institutional Buyers', pct: 15, description: 'Schools, panchayat office, and community gatherings' }
        ],
        peakBusinessHours: [
          { window: '08:00 AM - 11:00 AM', trafficLevel: 'High', note: 'Morning commercial transactions' },
          { window: '12:00 PM - 03:00 PM', trafficLevel: 'Normal', note: 'Midday operations & stock management' },
          { window: '05:00 PM - 08:00 PM', trafficLevel: 'Peak', note: 'Evening market shopping traffic' }
        ],
        seasonalTrends: [
          { season: 'Harvest Season (Kharif/Rabi)', months: 'Oct - Jan', impactPct: 35, trend: 'peak', description: 'Agrarian liquidity injection drives highest discretionary spending' },
          { season: 'Wedding & Social Months', months: 'Feb - Apr', impactPct: 20, trend: 'peak', description: 'Celebratory purchases and social gatherings' },
          { season: 'Heavy Monsoon Days', months: 'Jul - Aug', impactPct: -15, trend: 'lean', description: 'Weather interruptions to market transit' }
        ],
        logistics: {
          primarySupplier: 'Sub-Divisional Trade Distributors',
          procurementFrequency: 'Weekly replenishment',
          avgTripCost: '?180',
          turnoverDays: 10
        },
        actionableInsights: [
          'Locate close to the primary village bus stop or panchayat office to maximize spontaneous customer traffic.',
          'Maintain strict quality and transparent pricing to gain word-of-mouth community references.',
          'Keep adequate liquid working capital reserves to navigate seasonal agrarian income lags.'
        ]
      };
  }
}
