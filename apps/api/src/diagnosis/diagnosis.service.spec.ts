import { DiagnosisService } from './diagnosis.service';
import type { DiagnosisConfig } from './diagnosis.types';

describe('DiagnosisService', () => {
  const service = new DiagnosisService();

  it('scores categories and emits default MCOM-mapped recommendations', () => {
    const result = service.build({
      answers: [
        {
          questionId: 'q-capacity',
          questionText: 'How much spare capacity do you have?',
          category: 'SPARE_CAPACITY',
          value: 0,
          scoreMax: 10,
        },
        {
          questionId: 'q-stock',
          questionText: 'Do you hold slow-moving stock?',
          category: 'EXCESS_STOCK',
          value: 0,
          scoreMax: 10,
        },
      ],
    });

    expect(result.configSource).toBe('default');
    expect(result.overallScore).toBe(0);
    expect(result.healthCategories.map((c) => c.id).sort()).toEqual([
      'inventory',
      'operations',
    ]);
    expect(result.recommendations.map((r) => r.id)).toEqual(
      expect.arrayContaining(['rule-capacity', 'rule-stock']),
    );
    expect(result.recommendations[0].services.length).toBeGreaterThan(0);
    expect(result.mcomServiceMapping.length).toBeGreaterThan(0);
  });

  it('uses the admin-configured categories, rules and service mapping', () => {
    const config: DiagnosisConfig = {
      enabled: true,
      categories: [
        {
          key: 'ops',
          label: 'Operations',
          weight: 1,
          questionCategories: ['SPARE_CAPACITY'],
          keywords: [],
        },
      ],
      thresholds: { excellent: 80, good: 60, average: 40, poor: 20 },
      rules: [
        {
          id: 'custom-rule',
          title: 'Book a mentoring session',
          summary: 'Custom summary',
          action: 'Custom action',
          priority: 'high',
          serviceIds: ['business-mentoring'],
          match: 'all',
          conditions: [{ source: 'category', key: 'ops', operator: 'lt', value: 50 }],
          isActive: true,
        },
      ],
    };

    const result = service.build({
      config,
      answers: [
        {
          questionId: 'q1',
          questionText: 'Capacity',
          category: 'SPARE_CAPACITY',
          value: 0,
          scoreMax: 10,
        },
      ],
    });

    expect(result.configSource).toBe('admin');
    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0].id).toBe('custom-rule');
    expect(result.recommendations[0].services).toEqual([
      { id: 'business-mentoring', name: 'MCOM Business Mentoring', category: 'Advisory & Delivery' },
    ]);
  });

  it('inverts legacy lower-is-better risk scores', () => {
    const result = service.build({
      answers: [
        {
          questionId: 'q-stock',
          questionText: 'Do you hold slow-moving or excess inventory?',
          category: 'EXCESS_STOCK',
          value: 3,
          scoreMax: 3,
          scoreDirection: 'lower',
        },
      ],
    });

    expect(result.healthCategories[0].id).toBe('inventory');
    expect(result.healthCategories[0].score).toBe(0);
    expect(result.recommendations.map((r) => r.id)).toContain('rule-stock');
  });

  it('keeps higher-is-better scores for new templates', () => {
    const result = service.build({
      answers: [
        {
          questionId: 'q-stock',
          questionText: 'Do you hold slow-moving or excess inventory?',
          category: 'EXCESS_STOCK',
          value: 10,
          scoreMax: 10,
          scoreDirection: 'higher',
        },
      ],
    });

    expect(result.healthCategories[0].score).toBe(100);
    expect(result.recommendations.map((r) => r.id)).not.toContain('rule-stock');
  });

  it('honours the admin enabled flag', () => {
    const result = service.build({
      config: { enabled: false, categories: [], rules: [] },
      answers: [
        { questionId: 'q1', questionText: 'Capacity', category: 'SPARE_CAPACITY', value: 0 },
      ],
    });

    expect(result.overallScore).toBe(0);
    expect(result.recommendations).toHaveLength(0);
    expect(result.executiveSummary).toContain('disabled');
  });
});
