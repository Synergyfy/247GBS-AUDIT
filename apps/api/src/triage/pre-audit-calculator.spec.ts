import { calculatePreAuditDiagnosis } from './pre-audit-calculator';

describe('PreAuditDiagnosticCalculator', () => {
  it('should calculate the funding gap correctly according to Henry\'s model (£4,500 need - £1,500 own = £3,000 gap)', () => {
    const steps = [
      {
        questionText: 'What type of business do you operate?',
        optionTexts: ['B2B Services & Consultancy'],
      },
      {
        questionText: 'What do you currently need help with?',
        optionTexts: ['Funding & Investment', 'Spare Capacity / Idle Resources'],
      },
      {
        questionText: 'How much funding do you currently need?',
        value: 4500,
        optionTexts: ['£1,001–£5,000'],
      },
      {
        questionText: 'How much can you currently contribute yourself toward your business goals?',
        value: 1500,
        optionTexts: ['£1,001–£5,000'],
      },
      {
        questionText: 'Approximately how much spare capacity do you currently have?',
        optionTexts: ['26–50%'],
      },
      {
        questionText: 'When do you normally have the most spare capacity?',
        optionTexts: ['Autumn shoulder months'],
      },
      {
        questionText: 'Would you like to involve your accountant in the financial and seasonal review?',
        optionTexts: ['Yes'],
        value: 'accountant@tobybarbers.co.uk',
      },
    ];

    const result = calculatePreAuditDiagnosis(steps);

    // 1. Funding Gap Formula verification
    expect(result.funding.fundingNeed).toBe(4500);
    expect(result.funding.ownContribution).toBe(1500);
    expect(result.funding.fundingGap).toBe(3000);
    expect(result.funding.fundingGapFormatted).toBe('£3,000');
    expect(result.funding.status).toBe('gap_identified');

    // 2. Operational & Seasonal extraction
    expect(result.operations.spareCapacityLevel).toBe('26–50%');
    expect(result.operations.spareCapacityPeakSeason).toContain('Autumn');

    // 3. Accountant extraction
    expect(result.accountant.involved).toBe(true);
    expect(result.accountant.email).toBe('accountant@tobybarbers.co.uk');

    // 4. Multi-Factor Intelligent Triage Recommendation
    // Business has £1,500 (enough for silver / short), but needs £4,500 and has autumn spare capacity
    // Recommendation must be LONG_FORM (Full Business Audit)
    expect(result.recommendation.auditType).toBe('LONG_FORM');
    expect(result.recommendation.rationale).toContain('£3,000');
  });

  it('should mark status as fully_funded when available funds meet or exceed need', () => {
    const steps = [
      {
        questionText: 'How much funding do you currently need?',
        value: 1000,
        optionTexts: ['£500–£1,000'],
      },
      {
        questionText: 'How much can you currently contribute yourself toward your business goals?',
        value: 1000,
        optionTexts: ['£501–£1,000'],
      },
      {
        questionText: 'Approximately how much spare capacity do you currently have?',
        optionTexts: ['Under 10%'],
      },
    ];

    const result = calculatePreAuditDiagnosis(steps);

    expect(result.funding.fundingGap).toBe(0);
    expect(result.funding.status).toBe('fully_funded');
    expect(result.recommendation.auditType).toBe('SHORT_FORM');
  });
});
