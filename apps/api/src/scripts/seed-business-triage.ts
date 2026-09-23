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
}

interface QuestionSeed {
  key: string;
  text: string;
  order: number;
  answers: AnswerSeed[];
}

// Branching Business Triage demo flow. Every path eventually reaches an audit
// (SHORT_FORM = Short Audit, LONG_FORM = Large Audit) and no loop exists.
const FLOW: Record<string, QuestionSeed> = {
  qPerformance: {
    key: 'qPerformance',
    order: 1,
    text: 'How would you describe your business performance today?',
    answers: [
      { text: "Good — we're growing and hitting targets", next: 'qSpareCapacity' },
      { text: 'Stable — holding steady but not growing', next: 'qExcessStock' },
      { text: 'Declining — sales or profit are falling', next: 'qRecovery' },
      { text: "Not sure — I don't regularly track performance", next: 'qFullAssessment' },
    ],
  },
  qExcessStock: {
    key: 'qExcessStock',
    order: 2,
    text: 'Do you currently have excess or slow-moving stock?',
    answers: [
      { text: 'Yes — we have stock that is not selling', next: 'qRecovery' },
      { text: 'No — our stock moves quickly', next: 'qSpareCapacity' },
      { text: "Not sure — I haven't checked recently", next: 'qFullAssessment' },
    ],
  },
  qSpareCapacity: {
    key: 'qSpareCapacity',
    order: 3,
    text: 'Do you have unused operational capacity (staff, equipment or space sitting idle)?',
    answers: [
      { text: 'Yes — staff, equipment, or space sit idle', next: 'qRecovery' },
      { text: 'No — we run at full capacity', auditType: 'SHORT_FORM' },
      { text: "Not sure — I haven't measured this", next: 'qFullAssessment' },
    ],
  },
  qRecovery: {
    key: 'qRecovery',
    order: 4,
    text: 'How much recovery potential do you estimate this represents each month?',
    answers: [
      { text: 'Under £1,000', next: 'qFullAssessment' },
      { text: '£1,000 – £5,000', auditType: 'LONG_FORM' },
      { text: 'More than £5,000', auditType: 'LONG_FORM' },
      { text: 'Not sure', next: 'qFullAssessment' },
    ],
  },
  qFullAssessment: {
    key: 'qFullAssessment',
    order: 5,
    text: 'Would you like a full in-depth assessment of your entire business?',
    answers: [
      { text: 'Yes', auditType: 'LONG_FORM' },
      { text: 'No', auditType: 'SHORT_FORM' },
    ],
  },
};

async function bootstrap() {
  console.log('--- Starting Business Triage Seeding ---');
  const app = await NestFactory.createApplicationContext(AppModule);
  const questionRepo = app.get<Repository<TriageQuestion>>(getRepositoryToken(TriageQuestion));
  const answerRepo = app.get<Repository<TriageAnswer>>(getRepositoryToken(TriageAnswer));

  const ids = new Map<string, string>();

  for (const seed of Object.values(FLOW)) {
    let question = await questionRepo.findOne({ where: { text: seed.text } });
    if (!question) {
      question = await questionRepo.save(
        questionRepo.create({ text: seed.text, order: seed.order, isActive: true }),
      );
      console.log(`[CREATED] Question: ${seed.text}`);
    } else {
      console.log(`[EXISTS] Question: ${seed.text}`);
    }
    ids.set(seed.key, question.id);

    const existingAnswers = await answerRepo.find({ where: { questionId: question.id } });
    const existingTexts = new Set(existingAnswers.map((a) => a.text));

    for (const answerSeed of seed.answers) {
      if (existingTexts.has(answerSeed.text)) {
        console.log(`[SKIP] Answer: "${answerSeed.text}"`);
        continue;
      }
      const destination = answerSeed.auditType
        ? { auditType: answerSeed.auditType, nextQuestionId: null }
        : { auditType: null, nextQuestionId: null };
      await answerRepo.save(
        answerRepo.create({
          questionId: question.id,
          text: answerSeed.text,
          isActive: true,
          ...destination,
        }),
      );
      console.log(`[CREATED] Answer: "${answerSeed.text}"`);
    }
  }

  // Resolve next-question references (created after all questions exist).
  for (const seed of Object.values(FLOW)) {
    const questionId = ids.get(seed.key)!;
    const answers = await answerRepo.find({ where: { questionId } });
    for (const answer of answers) {
      const def = seed.answers.find((a) => a.text === answer.text);
      if (def?.next && !answer.nextQuestionId) {
        answer.nextQuestionId = ids.get(def.next) ?? null;
        await answerRepo.save(answer);
        console.log(`[LINKED] "${answer.text}" -> ${def.next}`);
      }
    }
  }

  console.log('--- Business Triage Seeding Complete ---');
  await app.close();
}

bootstrap().catch((err) => {
  console.error('--- Seeding Failed ---');
  console.error(err);
  process.exit(1);
});