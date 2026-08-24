export type PlanId = 'bronze' | 'silver' | 'gold' | 'platinum';
export type TierId = 'normal' | 'pro' | 'pro-plus';

export interface PlanTier {
  id: TierId;
  name: string;
  price: string;
  priceSuffix: string;
  features: string[];
  highlighted?: boolean;
}

export interface PricingPlan {
  id: PlanId;
  name: string;
  description: string;
  icon: string;
  color: string;
  badgeColor: string;
  bgGradient: string;
  tiers: PlanTier[];
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    description: 'Essential audit tools for small businesses getting started with business improvement.',
    icon: 'Award',
    color: 'text-amber-700',
    badgeColor: 'bg-amber-100 text-amber-700',
    bgGradient: 'from-amber-50 to-amber-100/30',
    tiers: [
      {
        id: 'normal',
        name: 'Normal',
        price: 'Free',
        priceSuffix: '',
        features: [
          '15-minute Business Triage',
          'Short Business Audit',
          'Basic business health score',
          'Email support',
          'Single user access'
        ]
      },
      {
        id: 'pro',
        name: 'Pro',
        price: '£29',
        priceSuffix: '/month',
        features: [
          'Everything in Normal plus:',
          'Long Business Audit',
          'Detailed business diagnosis',
          'Priority recommendations',
          'Basic downloadable report',
          '2 team members'
        ],
        highlighted: true
      },
      {
        id: 'pro-plus',
        name: 'Pro+',
        price: '£49',
        priceSuffix: '/month',
        features: [
          'Everything in Pro plus:',
          'Quarterly re-audit reminders',
          'Priority email & chat support',
          'Exportable diagnosis report',
          'Up to 5 team members'
        ]
      }
    ]
  },
  {
    id: 'silver',
    name: 'Silver',
    description: 'Advanced diagnostics for growing businesses ready to scale their operations.',
    icon: 'Medal',
    color: 'text-slate-500',
    badgeColor: 'bg-slate-100 text-slate-700',
    bgGradient: 'from-slate-50 to-slate-100/30',
    tiers: [
      {
        id: 'normal',
        name: 'Normal',
        price: '£79',
        priceSuffix: '/month',
        features: [
          'Everything in Bronze Pro+ plus:',
          'Multi-sector audit support',
          'Deeper health analysis (10 categories)',
          'Growth opportunity identification',
          'Priority matrix & risk assessment',
          'Up to 5 team members'
        ]
      },
      {
        id: 'pro',
        name: 'Pro',
        price: '£129',
        priceSuffix: '/month',
        features: [
          'Everything in Silver Normal plus:',
          'Recommended Solutions Engine',
          'Budget & timeframe planning',
          'Implementation roadmap (3 phases)',
          'Business Improvement Plan PDF',
          '10 team members'
        ],
        highlighted: true
      },
      {
        id: 'pro-plus',
        name: 'Pro+',
        price: '£199',
        priceSuffix: '/month',
        features: [
          'Everything in Silver Pro plus:',
          'Account Manager check-in (monthly)',
          'Personalised improvement coaching',
          'Progress tracking dashboard',
          'Quarterly business health review',
          'Unlimited team members'
        ]
      }
    ]
  },
  {
    id: 'gold',
    name: 'Gold',
    description: 'Comprehensive growth platform for established businesses with dedicated support.',
    icon: 'Star',
    color: 'text-yellow-600',
    badgeColor: 'bg-yellow-100 text-yellow-700',
    bgGradient: 'from-yellow-50 to-yellow-100/30',
    tiers: [
      {
        id: 'normal',
        name: 'Normal',
        price: '£249',
        priceSuffix: '/month',
        features: [
          'Everything in Silver Pro+ plus:',
          'Advanced analytics & insights',
          'MCOM Mall marketplace listing',
          '247GBS Expo event access',
          'Customer retention tools',
          'Marketing automation integration',
          'Priority support (24hr response)'
        ]
      },
      {
        id: 'pro',
        name: 'Pro',
        price: '£399',
        priceSuffix: '/month',
        features: [
          'Everything in Gold Normal plus:',
          'Full MCOM ecosystem access',
          'Dedicated Account Manager',
          'Bi-weekly progress reviews',
          'Custom implementation roadmap',
          'Multi-branch audit support',
          'API access for integrations'
        ],
        highlighted: true
      },
      {
        id: 'pro-plus',
        name: 'Pro+',
        price: '£599',
        priceSuffix: '/month',
        features: [
          'Everything in Gold Pro plus:',
          'Weekly Account Manager sessions',
          'Business Consulting credits',
          'Advanced AI-powered insights',
          'Custom report builder',
          'White-label report options',
          'SLA guarantee'
        ]
      }
    ]
  },
  {
    id: 'platinum',
    name: 'Platinum',
    description: 'Enterprise-grade solution for multi-location businesses requiring full ecosystem integration.',
    icon: 'Crown',
    color: 'text-purple-700',
    badgeColor: 'bg-purple-100 text-purple-700',
    bgGradient: 'from-purple-50 to-purple-100/30',
    tiers: [
      {
        id: 'normal',
        name: 'Normal',
        price: '£899',
        priceSuffix: '/month',
        features: [
          'Everything in Gold Pro+ plus:',
          'Enterprise-wide audit management',
          'Multi-location business tracking',
          'Full MCOM ecosystem integration',
          'International expansion tools',
          'Advanced Business Intelligence',
          'Dedicated onboarding specialist',
          '24/7 priority support'
        ]
      },
      {
        id: 'pro',
        name: 'Pro',
        price: '£1,499',
        priceSuffix: '/month',
        features: [
          'Everything in Platinum Normal plus:',
          'Unlimited Business Audits',
          'Unlimited team members',
          'Full Account Manager service',
          'Business Consulting Programme',
          'Custom integration support',
          'Executive business reviews',
          'Dedicated success manager'
        ],
        highlighted: true
      },
      {
        id: 'pro-plus',
        name: 'Pro+',
        price: '£2,499',
        priceSuffix: '/month',
        features: [
          'Everything in Platinum Pro plus:',
          'Strategic business partnership',
          'Monthly strategy sessions',
          'Priority development roadmap',
          'Beta feature early access',
          'Custom MCOM solution development',
          'White-glove implementation',
          'Executive sponsor'
        ]
      }
    ]
  }
];

export function getPlanById(id: PlanId): PricingPlan | undefined {
  return PRICING_PLANS.find(p => p.id === id);
}

export function getPlanIcon(iconName: string): string {
  const icons: Record<string, string> = {
    Award: '🏅',
    Medal: '🎖️',
    Star: '⭐',
    Crown: '👑'
  };
  return icons[iconName] || '⭐';
}
