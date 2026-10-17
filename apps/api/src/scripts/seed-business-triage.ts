import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TriageQuestion } from '../triage/entities/triage-question.entity';
import { TriageAnswer } from '../triage/entities/triage-answer.entity';

interface AnswerSeed {
  text: string;
  next?: string; // question key
  auditType?: string; // SHORT_FORM | LONG_FORM
  destinationType?: string;
  destinationTarget?: string;
}

interface QuestionSeed {
  key: string;
  text: string;
  type?: string;
  order: number;
  config?: Record<string, any>;
  defaultNext?: string;
  answers?: AnswerSeed[];
}

/**
 * Public Pre-Audit Question Map — Built from the exact 18-section specification:
 * - Business Basics (Type, Location, Operating status, Tenure)
 * - Need Triage & Adaptive Multi-Branches (Funding, Marketing, Stock, Spare Capacity)
 * - Self-Funding & Other Contributors
 * - Funding Gap Analysis
 * - Seasonal Fluctuations
 * - Digital & Outreach Presence
 * - Readiness to Act
 * - Accountant Collaboration
 */
const FLOW: Record<string, QuestionSeed> = {
  // 1. Business Type
  qBusinessType: {
    key: 'qBusinessType',
    order: 1,
    text: 'What type of business do you operate?',
    type: 'single_choice',
    answers: [
      { text: 'Retail & Consumer Goods', next: 'qLocation' },
      { text: 'B2B Services & Consultancy', next: 'qLocation' },
      { text: 'Hospitality & Leisure', next: 'qLocation' },
      { text: 'Manufacturing & Distribution', next: 'qLocation' },
      { text: 'Trades & Construction', next: 'qLocation' },
      { text: 'Other Business Type', next: 'qLocation' },
    ],
  },

  // 2. Location
  qLocation: {
    key: 'qLocation',
    order: 2,
    text: 'Where is your business located? (Postcode or Town)',
    type: 'short_text',
    config: { placeholder: 'e.g. Manchester, M1 1AE' },
    defaultNext: 'qOperatingStatus',
  },

  // 3. Operating Status
  qOperatingStatus: {
    key: 'qOperatingStatus',
    order: 3,
    text: 'Is your business currently operating?',
    type: 'single_choice',
    answers: [
      { text: 'Yes, currently operating', next: 'qOperatingTenure' },
      { text: 'Preparing to open / Early stage', next: 'qOperatingTenure' },
      { text: 'Temporarily not operating', next: 'qOperatingTenure' },
    ],
  },

  // 4. Operating Tenure
  qOperatingTenure: {
    key: 'qOperatingTenure',
    order: 4,
    text: 'How long have you been operating?',
    type: 'single_choice',
    answers: [
      { text: 'Less than 6 months', next: 'qNeeds' },
      { text: '6–12 months', next: 'qNeeds' },
      { text: '1–2 years', next: 'qNeeds' },
      { text: '3–5 years', next: 'qNeeds' },
      { text: '5+ years', next: 'qNeeds' },
    ],
  },

  // 5. Core Needs (Multi-Select Branch Head)
  qNeeds: {
    key: 'qNeeds',
    order: 5,
    text: 'What do you currently need help with?',
    type: 'multiple_choice',
    answers: [
      { text: 'Funding & Investment', next: 'qFundingAmount' },
      { text: 'Marketing & Customer Acquisition', next: 'qMarketingSupport' },
      { text: 'Excess Stock / Inventory Flow', next: 'qStockAvailable' },
      { text: 'Spare Capacity / Idle Resources', next: 'qCapacityType' },
      { text: 'General Business Assessment', next: 'qOwnFunds' },
    ],
  },

  // BRANCH: FUNDING NEED
  qFundingAmount: {
    key: 'qFundingAmount',
    order: 6,
    text: 'How much funding do you currently need?',
    type: 'single_choice',
    answers: [
      { text: 'Under £1,000', next: 'qFundingTiming' },
      { text: '£1,001–£5,000', next: 'qFundingTiming' },
      { text: '£5,001–£10,000', next: 'qFundingTiming' },
      { text: '£10,001–£25,000', next: 'qFundingTiming' },
      { text: '£25,001+', next: 'qFundingTiming' },
    ],
  },
  qFundingTiming: {
    key: 'qFundingTiming',
    order: 7,
    text: 'When do you need the funding?',
    type: 'single_choice',
    answers: [
      { text: 'Immediately', next: 'qOwnFunds' },
      { text: 'Within 30 days', next: 'qOwnFunds' },
      { text: 'Within 1–3 months', next: 'qOwnFunds' },
      { text: 'Seasonal / Specific period', next: 'qFundingSeason' },
    ],
  },
  qFundingSeason: {
    key: 'qFundingSeason',
    order: 8,
    text: 'When does the seasonal funding need occur?',
    type: 'single_choice',
    answers: [
      { text: 'Spring surge', next: 'qOwnFunds' },
      { text: 'Summer peak', next: 'qOwnFunds' },
      { text: 'Autumn preparation', next: 'qOwnFunds' },
      { text: 'Winter holiday season', next: 'qOwnFunds' },
    ],
  },

  // BRANCH: MARKETING NEED
  qMarketingSupport: {
    key: 'qMarketingSupport',
    order: 9,
    text: 'What marketing support do you currently need?',
    type: 'multiple_choice',
    answers: [
      { text: 'Getting new customers', next: 'qMarketingBudget' },
      { text: 'Increasing repeat customers', next: 'qMarketingBudget' },
      { text: 'Local community awareness', next: 'qMarketingBudget' },
      { text: 'Social media & digital promotions', next: 'qMarketingBudget' },
    ],
  },
  qMarketingBudget: {
    key: 'qMarketingBudget',
    order: 10,
    text: 'What marketing budget do you currently have available?',
    type: 'single_choice',
    answers: [
      { text: '£0', next: 'qOwnFunds' },
      { text: 'Under £100', next: 'qOwnFunds' },
      { text: '£100–£500', next: 'qOwnFunds' },
      { text: '£500–£1,000', next: 'qOwnFunds' },
      { text: '£1,000+', next: 'qOwnFunds' },
    ],
  },

  // BRANCH: STOCK
  qStockAvailable: {
    key: 'qStockAvailable',
    order: 11,
    text: 'Approximately what proportion of your stock is currently slow-moving or excess?',
    type: 'single_choice',
    answers: [
      { text: 'Less than 10%', next: 'qStockSeasonal' },
      { text: '10–25%', next: 'qStockSeasonal' },
      { text: '26–50%', next: 'qStockSeasonal' },
      { text: 'More than 50%', next: 'qStockSeasonal' },
    ],
  },
  qStockSeasonal: {
    key: 'qStockSeasonal',
    order: 12,
    text: 'Which period normally has the highest stock pressure?',
    type: 'single_choice',
    answers: [
      { text: 'Spring', next: 'qOwnFunds' },
      { text: 'Summer', next: 'qOwnFunds' },
      { text: 'Autumn', next: 'qOwnFunds' },
      { text: 'Winter', next: 'qOwnFunds' },
      { text: 'Stock pressure occurs all year', next: 'qOwnFunds' },
    ],
  },

  // BRANCH: SPARE CAPACITY
  qCapacityType: {
    key: 'qCapacityType',
    order: 13,
    text: 'What type of spare operational capacity do you have?',
    type: 'multiple_choice',
    answers: [
      { text: 'Staff capacity / idle hours', next: 'qCapacityLevel' },
      { text: 'Physical space / rooms / desks', next: 'qCapacityLevel' },
      { text: 'Production or service equipment', next: 'qCapacityLevel' },
      { text: 'Appointment or booking slots', next: 'qCapacityLevel' },
    ],
  },
  qCapacityLevel: {
    key: 'qCapacityLevel',
    order: 14,
    text: 'Approximately how much spare capacity do you currently have?',
    type: 'single_choice',
    answers: [
      { text: 'Under 10%', next: 'qCapacitySeason' },
      { text: '10–25%', next: 'qCapacitySeason' },
      { text: '26–50%', next: 'qCapacitySeason' },
      { text: '76%+', next: 'qCapacitySeason' },
    ],
  },
  qCapacitySeason: {
    key: 'qCapacitySeason',
    order: 15,
    text: 'When do you normally have the most spare capacity?',
    type: 'single_choice',
    answers: [
      { text: 'Spring mid-week', next: 'qOwnFunds' },
      { text: 'Summer off-peak', next: 'qOwnFunds' },
      { text: 'Autumn shoulder months', next: 'qOwnFunds' },
      { text: 'Winter slow periods', next: 'qOwnFunds' },
      { text: 'Consistent throughout the year', next: 'qOwnFunds' },
    ],
  },

  // SELF-FUNDING & RESOURCES
  qOwnFunds: {
    key: 'qOwnFunds',
    order: 16,
    text: 'How much can you currently contribute yourself toward your business goals?',
    type: 'single_choice',
    answers: [
      { text: '£0', next: 'qOtherSupport' },
      { text: '£1–£100', next: 'qOtherSupport' },
      { text: '£101–£500', next: 'qOtherSupport' },
      { text: '£501–£1,000', next: 'qOtherSupport' },
      { text: '£1,001–£5,000', next: 'qOtherSupport' },
      { text: '£5,001+', next: 'qOtherSupport' },
    ],
  },

  // OTHER SUPPORT
  qOtherSupport: {
    key: 'qOtherSupport',
    order: 17,
    text: 'Do you have other sources that may contribute? (Family, staff, partners, backers)',
    type: 'single_choice',
    answers: [
      { text: 'Yes, additional support is available', next: 'qDigitalChannels' },
      { text: 'No, funding depends on business income', next: 'qDigitalChannels' },
    ],
  },

  // DIGITAL FOUNDATION & OUTREACH
  qDigitalChannels: {
    key: 'qDigitalChannels',
    order: 18,
    text: 'Which digital channels do you currently use for outreach?',
    type: 'multiple_choice',
    answers: [
      { text: 'Website', next: 'qOnlinePresence' },
      { text: 'Social media', next: 'qOnlinePresence' },
      { text: 'Google Business profile', next: 'qOnlinePresence' },
      { text: 'Email newsletter', next: 'qOnlinePresence' },
      { text: 'None of the above', next: 'qOnlinePresence' },
    ],
  },
  qOnlinePresence: {
    key: 'qOnlinePresence',
    order: 19,
    text: 'How would you describe your current online presence?',
    type: 'single_choice',
    answers: [
      { text: 'Strong and established', next: 'qReadiness' },
      { text: 'Established but needs improvement', next: 'qReadiness' },
      { text: 'Basic / Minimal', next: 'qReadiness' },
      { text: 'Very limited or None', next: 'qReadiness' },
    ],
  },

  // BUSINESS READINESS
  qReadiness: {
    key: 'qReadiness',
    order: 20,
    text: 'Are you ready to take action on the needs you have identified?',
    type: 'single_choice',
    answers: [
      { text: 'Yes, immediately', next: 'qAccountant' },
      { text: 'Yes, but I need preparation first', next: 'qAccountant' },
      { text: 'Exploring options / Not yet', next: 'qAccountant' },
    ],
  },

  // ACCOUNTANT COLLABORATION
  qAccountant: {
    key: 'qAccountant',
    order: 21,
    text: 'Would you like to involve your accountant to assist with financial verification?',
    type: 'single_choice',
    answers: [
      { text: 'Yes, I would like to involve my accountant', next: 'qAccountantEmail' },
      { text: 'No, continue without an accountant', auditType: 'SHORT_FORM' },
    ],
  },
  qAccountantEmail: {
    key: 'qAccountantEmail',
    order: 22,
    text: "Please provide your accountant's email address (optional):",
    type: 'short_text',
    config: { placeholder: 'accountant@yourfirm.com' },
    answers: [
      { text: 'Submit and get recommendations', auditType: 'LONG_FORM' },
    ],
  },
};

async function bootstrap() {
  console.log('--- Starting Complete Business Triage Seeding ---');
  const app = await NestFactory.createApplicationContext(AppModule);
  const questionRepo = app.get<Repository<TriageQuestion>>(getRepositoryToken(TriageQuestion));
  const answerRepo = app.get<Repository<TriageAnswer>>(getRepositoryToken(TriageAnswer));

  const ids = new Map<string, string>();

  // 1. Create or update questions
  for (const seed of Object.values(FLOW)) {
    let question = await questionRepo.findOne({ where: { text: seed.text } });
    if (!question) {
      question = await questionRepo.save(
        questionRepo.create({
          text: seed.text,
          type: seed.type || 'single_choice',
          config: seed.config || {},
          order: seed.order,
          isActive: true,
        }),
      );
      console.log(`[CREATED] Question: ${seed.text} (${seed.type || 'single_choice'})`);
    } else {
      question.type = seed.type || question.type || 'single_choice';
      question.config = seed.config || question.config || {};
      question.order = seed.order;
      await questionRepo.save(question);
      console.log(`[UPDATED] Question: ${seed.text}`);
    }
    ids.set(seed.key, question.id);
  }

  // 2. Link default next for option-less questions
  for (const seed of Object.values(FLOW)) {
    if (seed.defaultNext) {
      const qId = ids.get(seed.key);
      const nextId = ids.get(seed.defaultNext);
      if (qId && nextId) {
        await questionRepo.update(qId, { defaultNextQuestionId: nextId });
        console.log(`[LINKED DEFAULT] ${seed.text} -> ${seed.defaultNext}`);
      }
    }
  }

  // 3. Create or update answers
  for (const seed of Object.values(FLOW)) {
    const qId = ids.get(seed.key)!;
    const existingAnswers = await answerRepo.find({ where: { questionId: qId } });
    const existingByText = new Map(existingAnswers.map((a) => [a.text, a]));

    for (const [idx, answerSeed] of (seed.answers || []).entries()) {
      let answer = existingByText.get(answerSeed.text);
      const dest = answerSeed.auditType
        ? { auditType: answerSeed.auditType, destinationType: answerSeed.destinationType || answerSeed.auditType }
        : { auditType: null, destinationType: null };

      if (!answer) {
        answer = await answerRepo.save(
          answerRepo.create({
            questionId: qId,
            text: answerSeed.text,
            sortOrder: idx + 1,
            isActive: true,
            ...dest,
          }),
        );
        console.log(`[CREATED] Answer: "${answerSeed.text}"`);
      } else {
        answer.auditType = dest.auditType;
        answer.destinationType = dest.destinationType;
        answer.sortOrder = idx + 1;
        await answerRepo.save(answer);
        console.log(`[UPDATED] Answer: "${answerSeed.text}"`);
      }
    }
  }

  // 4. Resolve next-question edges
  for (const seed of Object.values(FLOW)) {
    const questionId = ids.get(seed.key)!;
    const answers = await answerRepo.find({ where: { questionId } });
    for (const answer of answers) {
      const def = (seed.answers || []).find((a) => a.text === answer.text);
      if (def?.next) {
        const nextId = ids.get(def.next) ?? null;
        if (answer.nextQuestionId !== nextId) {
          answer.nextQuestionId = nextId;
          await answerRepo.save(answer);
          console.log(`[LINKED EDGE] "${answer.text}" -> ${def.next}`);
        }
      }
    }
  }

  console.log('--- Complete Business Triage Seeding Finished Successfully ---');
  await app.close();
}

bootstrap().catch((err) => {
  console.error('--- Seeding Failed ---');
  console.error(err);
  process.exit(1);
});