import type { McomServiceDefinition } from './diagnosis.types';

/**
 * Central Hub Solution capability catalog used to map audit recommendations to
 * concrete services. Seeded locally today; the same shape can later be synced
 * from an `ecosystem/services` endpoint without changing the admin UI or rules.
 */
export const MCOM_SERVICES: McomServiceDefinition[] = [
  {
    id: 'excess-stock-programme',
    name: '247GBS Excess Stock Programme',
    slug: 'excess-stock-programme',
    category: 'Inventory & Working Capital',
    description:
      'Identify, value and liquidate slow-moving or excess stock through discount channels, B2B marketplaces and bundled offers.',
    capabilities: [
      'Inventory audit and classification',
      'Valuation and pricing strategy',
      'Clearance and B2B channel execution',
    ],
  },
  {
    id: 'spare-capacity-programme',
    name: '247GBS Spare Capacity Programme',
    slug: 'spare-capacity-programme',
    category: 'Operations & Utilisation',
    description:
      'Monetise underutilised staff hours, equipment time or facility space without adding fixed costs.',
    capabilities: [
      'Capacity and utilisation analysis',
      'Opportunity identification workshop',
      'Packaging, pricing and activation',
    ],
  },
  {
    id: 'rewards-loyalty',
    name: 'MCOM Rewards & Loyalty',
    slug: 'rewards-loyalty',
    category: 'Customers & Retention',
    description:
      'Design and deploy a structured loyalty programme — points, tiers, referrals and rewards — tailored to the business.',
    capabilities: [
      'Customer segmentation',
      'Reward and tier design',
      'Loyalty platform setup',
    ],
  },
  {
    id: 'marketing-automation',
    name: 'MCOM Marketing Automation',
    slug: 'marketing-automation',
    category: 'Marketing & Acquisition',
    description:
      'Consistent, automated campaigns that build a predictable customer acquisition pipeline.',
    capabilities: [
      'Campaign strategy and calendar',
      'Email/SMS automation',
      'Lead capture and nurture flows',
    ],
  },
  {
    id: 'digital-transformation',
    name: 'MCOM Digital Transformation',
    slug: 'digital-transformation',
    category: 'Technology & Systems',
    description:
      'Replace manual processes with integrated digital tools and real-time business visibility.',
    capabilities: [
      'Process mapping and automation',
      'System selection and integration',
      'Data and reporting setup',
    ],
  },
  {
    id: 'mcom-mall',
    name: 'MCOM Mall',
    slug: 'mcom-mall',
    category: 'Digital Channels',
    description:
      'An online marketplace channel that extends reach and sells products beyond the physical location.',
    capabilities: [
      'Storefront setup',
      'Product listing and merchandising',
      'Order and fulfilment support',
    ],
  },
  {
    id: 'cash-flow-management',
    name: 'MCOM Cash-Flow Management',
    slug: 'cash-flow-management',
    category: 'Finance',
    description:
      'Improve financial stability through cash-flow forecasting, cost control and margin management.',
    capabilities: [
      'Cash-flow forecasting',
      'Cost and margin review',
      'Financial reporting cadence',
    ],
  },
  {
    id: 'funding-readiness',
    name: 'MCOM Funding Readiness',
    slug: 'funding-readiness',
    category: 'Finance',
    description:
      'Prepare the business for grants, investment or lending with a clear funding gap and use-of-funds case.',
    capabilities: [
      'Funding gap analysis',
      'Financial pack preparation',
      'Lender/investor readiness review',
    ],
  },
  {
    id: 'account-manager',
    name: 'MCOM Account Manager',
    slug: 'account-manager',
    category: 'Advisory & Delivery',
    description:
      'A dedicated account manager who coordinates the improvement plan and keeps execution on track.',
    capabilities: [
      'Delivery coordination',
      'Progress reporting',
      'Cross-service orchestration',
    ],
  },
  {
    id: 'business-mentoring',
    name: 'MCOM Business Mentoring',
    slug: 'business-mentoring',
    category: 'Advisory & Delivery',
    description:
      'Structured mentoring for owners and leaders to build capability and make better operating decisions.',
    capabilities: [
      'Leadership coaching',
      'Operating rhythm setup',
      'Accountability and review',
    ],
  },
  {
    id: 'gbs-expo',
    name: '247GBS Expo',
    slug: 'gbs-expo',
    category: 'Marketing & Acquisition',
    description:
      'Industry exposure and networking opportunities that connect the business with buyers and partners.',
    capabilities: [
      'Exhibitor packages',
      'Buyer matchmaking',
      'Brand exposure',
    ],
  },
  {
    id: 'international-expansion',
    name: 'MCOM International Expansion',
    slug: 'international-expansion',
    category: 'Growth',
    description:
      'Market-entry support for businesses ready to expand into new regions or export channels.',
    capabilities: [
      'Market assessment',
      'Entry route planning',
      'Partner and channel sourcing',
    ],
  },
];

export function getMcomService(id: string): McomServiceDefinition | undefined {
  return MCOM_SERVICES.find((service) => service.id === id);
}
