/**
 * Pre-Audit Financial Gap & Diagnostic Calculator (Frontend).
 *
 * Implements the financial gap formula from the Pre-Audit specification:
 *   Total Need - Own Contribution - Other Available Contribution = Funding Gap
 *
 * Provides real-time calculation and rich takeaway rendering for the user.
 */

export interface PreAuditDiagnosticSummary {
  funding: {
    fundingNeed: number | null;
    fundingNeedFormatted: string | null;
    ownContribution: number | null;
    ownContributionFormatted: string | null;
    otherContribution: number | null;
    otherContributionFormatted: string | null;
    fundingGap: number | null;
    fundingGapFormatted: string | null;
    status: 'fully_funded' | 'gap_identified' | 'not_specified';
    timing: string | null;
    season: string | null;
  };
  marketing: {
    budget: number | null;
    budgetFormatted: string | null;
    needs: string[];
    timing: string | null;
    digitalPresence: string | null;
    channels: string[];
  };
  operations: {
    excessStockLevel: string | null;
    excessStockSeasonal: boolean;
    excessStockPeakSeason: string | null;
    spareCapacityType: string[];
    spareCapacityLevel: string | null;
    spareCapacitySeasonal: boolean;
    spareCapacityPeakSeason: string | null;
  };
  business: {
    category: string | null;
    location: string | null;
    operatingStatus: string | null;
    operatingTenure: string | null;
    identifiedNeeds: string[];
  };
  readiness: {
    level: 'immediate' | 'preparation_needed' | 'blocked' | 'not_specified';
    label: string;
    details: string[];
  };
  accountant: {
    involved: boolean;
    email: string | null;
  };
  recommendation: {
    auditType: 'SHORT_FORM' | 'LONG_FORM';
    title: string;
    rationale: string;
    keyTakeaway: string;
  };
}

export interface GenericAnswerStep {
  questionText?: string;
  questionId?: string;
  optionTexts?: string[];
  answerTexts?: string[];
  value?: any;
}

export function formatCurrency(amount: number | null): string | null {
  if (amount === null || isNaN(amount)) return null;
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(amount);
}

function extractPoundAmount(val: any, text: string = ''): number | null {
  if (typeof val === 'number' && !isNaN(val)) return val;
  if (typeof val === 'string' && val.trim()) {
    const cleaned = val.replace(/,/g, '').match(/\d+(?:\.\d+)?/);
    if (cleaned) {
      const parsed = parseFloat(cleaned[0]);
      if (!isNaN(parsed)) return parsed;
    }
  }

  const normalized = text.toLowerCase().replace(/,/g, '');
  if (!normalized) return null;

  if (normalized.includes('under £100') || normalized.includes('under 100')) return 100;
  if (normalized.includes('under £500') || normalized.includes('under 500')) return 500;
  if (normalized.includes('under £1000') || normalized.includes('under 1000') || normalized.includes('under £1,000')) return 1000;
  if (normalized.includes('£0') || normalized.includes('none') || normalized.includes('zero')) return 0;

  if (normalized.includes('£100–£500') || normalized.includes('100-500') || normalized.includes('100 - 500')) return 500;
  if (normalized.includes('£500–£1000') || normalized.includes('500-1000') || normalized.includes('500 - 1000')) return 1000;
  if (normalized.includes('£1001–£5000') || normalized.includes('1000-5000') || normalized.includes('1001-5000') || normalized.includes('1,001–5,000') || normalized.includes('1,000 – £5,000')) return 4500;
  if (normalized.includes('£5001–£10000') || normalized.includes('5000-10000') || normalized.includes('5001-10000') || normalized.includes('5,001–10,000')) return 10000;
  if (normalized.includes('£10001–£25000') || normalized.includes('10000-25000') || normalized.includes('10,001–25,000')) return 25000;
  if (normalized.includes('£25001+') || normalized.includes('25000+') || normalized.includes('more than £5000') || normalized.includes('more than 5000')) return 25000;

  const match = normalized.match(/£?(\d+(?:\.\d+)?)/);
  if (match) {
    const num = parseFloat(match[1]);
    if (!isNaN(num)) return num;
  }

  return null;
}

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

export function calculatePreAuditDiagnosis(steps: GenericAnswerStep[]): PreAuditDiagnosticSummary {
  let fundingNeed: number | null = null;
  let ownContribution: number | null = null;
  let otherContribution: number | null = null;
  let fundingTiming: string | null = null;
  let fundingSeason: string | null = null;

  let marketingBudget: number | null = null;
  const marketingNeeds: string[] = [];
  let marketingTiming: string | null = null;
  let digitalPresence: string | null = null;
  const outreachChannels: string[] = [];

  let excessStockLevel: string | null = null;
  let excessStockSeasonal = false;
  let excessStockPeakSeason: string | null = null;

  const spareCapacityType: string[] = [];
  let spareCapacityLevel: string | null = null;
  let spareCapacitySeasonal = false;
  let spareCapacityPeakSeason: string | null = null;

  let category: string | null = null;
  let location: string | null = null;
  let operatingStatus: string | null = null;
  let operatingTenure: string | null = null;
  const identifiedNeeds: string[] = [];

  let readinessLevel: 'immediate' | 'preparation_needed' | 'blocked' | 'not_specified' = 'not_specified';
  let readinessLabel = 'Assessment in Progress';
  const readinessDetails: string[] = [];

  let accountantInvolved = false;
  let accountantEmail: string | null = null;

  for (const step of steps) {
    const qText = (step.questionText || '').toLowerCase();
    const texts = Array.isArray(step.optionTexts)
      ? step.optionTexts
      : Array.isArray(step.answerTexts)
        ? step.answerTexts
        : [];
    const val = step.value;
    const combinedTexts = texts.join('; ');
    const allContent = `${combinedTexts} ${val ?? ''}`.trim();

    if (qText.includes('type of business') || qText.includes('business model')) {
      category = val ? String(val) : texts[0] || null;
    }

    if (qText.includes('where is your business') || qText.includes('location') || qText.includes('postcode')) {
      location = val ? String(val) : texts[0] || null;
    }

    if (qText.includes('currently operating')) {
      operatingStatus = texts[0] || (val ? String(val) : null);
    }

    if (qText.includes('how long have you been operating') || qText.includes('business tenure')) {
      operatingTenure = texts[0] || (val ? String(val) : null);
    }

    if (qText.includes('what do you currently need help with') || qText.includes('operational pressure')) {
      for (const t of texts) {
        if (!identifiedNeeds.includes(t)) identifiedNeeds.push(t);
      }
    }

    if (qText.includes('how much funding do you currently need') || qText.includes('amount of funding') || qText.includes('recovery potential')) {
      const parsed = extractPoundAmount(val, texts[0] || '');
      if (parsed !== null) fundingNeed = parsed;
    }
    if (qText.includes('when do you need the funding')) {
      fundingTiming = texts[0] || String(val || '');
    }
    if (qText.includes('funding need occur') || qText.includes('when does the funding need occur')) {
      fundingSeason = allContent || null;
    }

    if (qText.includes('contribute yourself') || qText.includes('own contribution') || qText.includes('can you contribute')) {
      const parsed = extractPoundAmount(val, texts[0] || '');
      if (parsed !== null) ownContribution = parsed;
    }

    if (qText.includes('other sources contribute') || qText.includes('other people contribute') || qText.includes('how much could these other sources')) {
      const parsed = extractPoundAmount(val, texts[0] || '');
      if (parsed !== null) otherContribution = parsed;
    }

    if (qText.includes('marketing support do you currently need')) {
      for (const t of texts) {
        if (!marketingNeeds.includes(t)) marketingNeeds.push(t);
      }
    }
    if (qText.includes('when is marketing most important')) {
      marketingTiming = texts[0] || String(val || '');
    }
    if (qText.includes('marketing budget do you currently have')) {
      const parsed = extractPoundAmount(val, texts[0] || '');
      if (parsed !== null) marketingBudget = parsed;
    }

    if (qText.includes('proportion of your stock') || qText.includes('stock that needs to be moved') || qText.includes('excess or slow-moving stock')) {
      excessStockLevel = texts[0] || (val ? String(val) : null);
    }
    if (qText.includes('stock situation change by season') || qText.includes('seasonal stock')) {
      excessStockSeasonal = texts.some((t) => t.toLowerCase().includes('yes')) || qText.includes('seasonal');
    }
    if (qText.includes('highest stock pressure') || qText.includes('stock peak')) {
      excessStockPeakSeason = allContent || null;
    }

    if (qText.includes('type of spare capacity')) {
      for (const t of texts) {
        if (!spareCapacityType.includes(t)) spareCapacityType.push(t);
      }
    }
    if (qText.includes('how much spare capacity') || qText.includes('unused operational capacity')) {
      spareCapacityLevel = texts[0] || (val ? String(val) : null);
    }
    if (qText.includes('spare capacity change by season')) {
      spareCapacitySeasonal = texts.some((t) => t.toLowerCase().includes('yes'));
    }
    if (qText.includes('most spare capacity') || qText.includes('capacity peak')) {
      spareCapacityPeakSeason = allContent || null;
    }

    if (qText.includes('how do people currently find you') || qText.includes('channels do you currently use')) {
      for (const t of texts) {
        if (!outreachChannels.includes(t)) outreachChannels.push(t);
      }
    }
    if (qText.includes('current online presence') || qText.includes('online presence')) {
      digitalPresence = texts[0] || (val ? String(val) : null);
    }

    if (qText.includes('ready to take action')) {
      const first = (texts[0] || '').toLowerCase();
      if (first.includes('immediately')) {
        readinessLevel = 'immediate';
        readinessLabel = 'Ready to Act Immediately';
      } else if (first.includes('preparation')) {
        readinessLevel = 'preparation_needed';
        readinessLabel = 'Preparation Needed First';
      } else if (first.includes('not yet') || first.includes('no')) {
        readinessLevel = 'blocked';
        readinessLabel = 'Currently Blocked / Exploring Options';
      }
    }
    if (qText.includes('what preparation do you need') || qText.includes('preventing you from proceeding') || qText.includes('ready to do now')) {
      for (const t of texts) {
        if (!readinessDetails.includes(t)) readinessDetails.push(t);
      }
    }

    if (qText.includes('accountant')) {
      if (texts.some((t) => t.toLowerCase() === 'yes')) {
        accountantInvolved = true;
      }
      const match = allContent.match(EMAIL_REGEX);
      if (match) {
        accountantInvolved = true;
        accountantEmail = match[0].toLowerCase();
      }
    }
  }

  let fundingGap: number | null = null;
  let fundingStatus: 'fully_funded' | 'gap_identified' | 'not_specified' = 'not_specified';

  if (fundingNeed !== null && fundingNeed > 0) {
    const contribution = (ownContribution ?? 0) + (otherContribution ?? 0);
    fundingGap = Math.max(0, fundingNeed - contribution);
    fundingStatus = fundingGap > 0 ? 'gap_identified' : 'fully_funded';
  } else if (ownContribution !== null && ownContribution > 0) {
    fundingStatus = 'fully_funded';
    fundingGap = 0;
  }

  const hasSubstantialGap = fundingGap !== null && fundingGap > 1000;
  const hasHighStock = excessStockLevel !== null && (excessStockLevel.includes('26') || excessStockLevel.includes('51') || excessStockLevel.includes('76') || excessStockLevel.toLowerCase().includes('yes'));
  const hasHighCapacity = spareCapacityLevel !== null && (spareCapacityLevel.includes('26') || spareCapacityLevel.includes('51') || spareCapacityLevel.includes('76') || spareCapacityLevel.toLowerCase().includes('yes'));
  const hasMultipleNeeds = identifiedNeeds.length >= 2;
  const needsDeepDiagnosis = hasSubstantialGap || hasHighStock || hasHighCapacity || hasMultipleNeeds || readinessLevel === 'preparation_needed';

  let auditType: 'SHORT_FORM' | 'LONG_FORM' = 'SHORT_FORM';
  let title = 'Short Business Audit Recommended';
  let rationale = 'Your responses reflect a focused operational scope. A Short Business Audit will provide a fast, targeted diagnosis.';
  let keyTakeaway = 'Streamlined, rapid diagnostic to benchmark your current operations.';

  if (needsDeepDiagnosis) {
    auditType = 'LONG_FORM';
    title = 'Full Business Audit Recommended';
    const reasons: string[] = [];
    if (hasSubstantialGap && fundingGap !== null) {
      reasons.push(`an identified funding gap of ${formatCurrency(fundingGap)}`);
    }
    if (hasHighStock) {
      reasons.push('inventory stock pressure');
    }
    if (hasHighCapacity) {
      reasons.push('unmonetized operational capacity');
    }
    if (hasMultipleNeeds) {
      reasons.push(`multiple key strategic needs (${identifiedNeeds.slice(0, 3).join(', ')})`);
    }

    rationale = `Your business has ${reasons.length ? reasons.join(', ') : 'complex strategic requirements'}. While your current funds may be limited, what your business needs is a comprehensive roadmap to unlock capacity and close the gap.`;
    keyTakeaway = 'In-depth business diagnosis to identify recovery potential and construct an actionable recovery plan.';
  }

  return {
    funding: {
      fundingNeed,
      fundingNeedFormatted: formatCurrency(fundingNeed),
      ownContribution,
      ownContributionFormatted: formatCurrency(ownContribution),
      otherContribution,
      otherContributionFormatted: formatCurrency(otherContribution),
      fundingGap,
      fundingGapFormatted: formatCurrency(fundingGap),
      status: fundingStatus,
      timing: fundingTiming,
      season: fundingSeason,
    },
    marketing: {
      budget: marketingBudget,
      budgetFormatted: formatCurrency(marketingBudget),
      needs: marketingNeeds,
      timing: marketingTiming,
      digitalPresence,
      channels: outreachChannels,
    },
    operations: {
      excessStockLevel,
      excessStockSeasonal,
      excessStockPeakSeason,
      spareCapacityType,
      spareCapacityLevel,
      spareCapacitySeasonal,
      spareCapacityPeakSeason,
    },
    business: {
      category,
      location,
      operatingStatus,
      operatingTenure,
      identifiedNeeds,
    },
    readiness: {
      level: readinessLevel,
      label: readinessLabel,
      details: readinessDetails,
    },
    accountant: {
      involved: accountantInvolved,
      email: accountantEmail,
    },
    recommendation: {
      auditType,
      title,
      rationale,
      keyTakeaway,
    },
  };
}
