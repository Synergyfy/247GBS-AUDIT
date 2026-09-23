import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PreAuditService } from './pre-audit.service';
import { TriageQuestion } from './entities/triage-question.entity';
import { TriageAnswer } from './entities/triage-answer.entity';
import { PreAuditSession } from './entities/pre-audit-session.entity';
import { PreAuditMailer } from '../mail/pre-audit-mailer';
import { SubmitPreAuditDto } from './dto/pre-audit.dto';

interface AnswerFixture {
  id: string;
  questionId: string;
  text: string;
  nextQuestionId?: string | null;
  auditType?: string | null;
  destinationType?: string | null;
  destinationTarget?: string | null;
  sortOrder: number;
}

function makeQuestion(
  id: string,
  text: string,
  type: string,
  order: number,
  cfg: Record<string, any> = {},
): TriageQuestion {
  return {
    id,
    text,
    type,
    description: null,
    hint: null,
    icon: null,
    required: true,
    config: cfg,
    defaultNextQuestionId: null,
    defaultAuditType: null,
    defaultDestinationType: null,
    defaultDestinationTarget: null,
    order,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as TriageQuestion;
}

function makeAnswer(a: AnswerFixture): TriageAnswer {
  return {
    id: a.id,
    questionId: a.questionId,
    text: a.text,
    nextQuestionId: a.nextQuestionId ?? null,
    auditType: a.auditType ?? null,
    destinationType: a.destinationType ?? null,
    destinationTarget: a.destinationTarget ?? null,
    sortOrder: a.sortOrder,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as TriageAnswer;
}

describe('PreAuditService', () => {
  let service: PreAuditService;
  let questions: TriageQuestion[];
  let answers: TriageAnswer[];
  let savedSessions: any[];
  let existingSessions: any[];

  const questionRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };
  const answerRepository = {
    find: jest.fn(),
  };
  const sessionRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  const mailer = {
    sendPostSubmission: jest.fn(),
  };

  beforeEach(async () => {
    savedSessions = [];
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PreAuditService,
        { provide: getRepositoryToken(TriageQuestion), useValue: questionRepository },
        { provide: getRepositoryToken(TriageAnswer), useValue: answerRepository },
        { provide: getRepositoryToken(PreAuditSession), useValue: sessionRepository },
        { provide: PreAuditMailer, useValue: mailer },
      ],
    }).compile();

    service = module.get<PreAuditService>(PreAuditService);

    questionRepository.findOne.mockImplementation((args: any) => {
      if (args?.where?.id) {
        return questions.find((q) => q.id === args.where.id) ?? null;
      }
      if (args?.where?.isActive === true) {
        const actives = questions
          .filter((q) => q.isActive)
          .sort((a, b) => a.order - b.order || a.createdAt.getTime() - b.createdAt.getTime());
        return actives[0] ?? null;
      }
      return null;
    });

    answerRepository.find.mockImplementation((args: any) => {
      if (!args?.where) return [];
      const filtered = answers.filter(
        (a) => a.questionId === args.where.questionId && a.isActive,
      );
      const order = args.order;
      return filtered.sort((x, y) => {
        if (order?.sortOrder === 'DESC') {
          return y.sortOrder - x.sortOrder || y.createdAt.getTime() - x.createdAt.getTime();
        }
        return x.sortOrder - y.sortOrder || x.createdAt.getTime() - y.createdAt.getTime();
      });
    });

    sessionRepository.findOne.mockImplementation((args: any) =>
      existingSessions.find((s) => s.fingerprint === args?.where?.fingerprint) ?? null,
    );
    sessionRepository.create.mockImplementation((input: any) => ({ id: 'session-uuid', ...input }));
    sessionRepository.save.mockImplementation((session: any) => {
      savedSessions.push(session);
      return Promise.resolve(session);
    });
    mailer.sendPostSubmission.mockResolvedValue(undefined);

    existingSessions = [];
    questions = [];
    answers = [];
  });

  const build = (
    qs: TriageQuestion[],
    ans: TriageAnswer[],
  ) => {
    questions = qs;
    answers = ans;
  };

  const submit = (dto: Partial<SubmitPreAuditDto> & Record<string, any>) =>
    service.evaluateAndSave(dto as SubmitPreAuditDto);

  // ==================== Linear flow ====================

  it('should reject when consent is not granted', async () => {
    build(
      [makeQuestion('q1', 'Q1', 'single_choice', 0)],
      [makeAnswer({ id: 'a1', questionId: 'q1', text: 'No consent', nextQuestionId: 'q2', sortOrder: 0 })],
    );
    await expect(
      submit({ steps: [], consentGranted: false }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should reject a flow when consent is missing for a real submission', async () => {
    build(
      [makeQuestion('q1', 'Q1', 'single_choice', 0)],
      [makeAnswer({ id: 'a1', questionId: 'q1', text: 'A', nextQuestionId: 'q2', sortOrder: 0 })],
    );
    await expect(
      submit({ steps: [{ questionId: 'q1', optionIds: ['a1'] }], consentGranted: false }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should walk a plain linear flow to LONG_FORM', async () => {
    build(
      [
        makeQuestion('q1', 'Q1', 'single_choice', 0),
        makeQuestion('q2', 'Q2', 'single_choice', 1),
      ],
      [
        makeAnswer({ id: 'a1', questionId: 'q1', text: 'Next', nextQuestionId: 'q2', sortOrder: 0 }),
        makeAnswer({ id: 'b1', questionId: 'q2', text: 'Do long', destinationType: 'LONG_FORM', sortOrder: 0 }),
      ],
    );

    const result = await submit({
      email: 'owner@example.com',
      steps: [
        { questionId: 'q1', optionIds: ['a1'] },
        { questionId: 'q2', optionIds: ['b1'] },
      ],
      consentGranted: true,
    });

    expect(result.recommendedAuditType).toBe('LONG_FORM');
    expect(result.destinationType).toBe('LONG_FORM');
    expect(result.answeredCount).toBe(2);
    expect(result.isDuplicate).toBe(false);
    expect(savedSessions).toHaveLength(1);
    expect(savedSessions[0].answers).toHaveLength(2);
    expect(mailer.sendPostSubmission).toHaveBeenCalledTimes(1);
  });

  it('should conclude as SHORT_FORM when the first question terminates the flow', async () => {
    build(
      [makeQuestion('q1', 'Q1', 'single_choice', 0)],
      [
        makeAnswer({ id: 'a1', questionId: 'q1', text: 'Do short', destinationType: 'SHORT_FORM', sortOrder: 0 }),
      ],
    );

    const result = await submit({
      steps: [{ questionId: 'q1', optionIds: ['a1'] }],
      consentGranted: true,
    });
    expect(result.recommendedAuditType).toBe('SHORT_FORM');
    expect(result.destinationType).toBe('SHORT_FORM');
  });

  it('should reject when a step no longer matches the expected linear chain', async () => {
    build(
      [
        makeQuestion('q1', 'Q1', 'single_choice', 0),
        makeQuestion('q2', 'Q2', 'single_choice', 1),
        makeQuestion('q3', 'Q3', 'single_choice', 2),
      ],
      [
        makeAnswer({ id: 'a1', questionId: 'q1', text: 'To q2', nextQuestionId: 'q2', sortOrder: 0 }),
        makeAnswer({ id: 'a2', questionId: 'q1', text: 'To q3', nextQuestionId: 'q3', sortOrder: 1 }),
        makeAnswer({ id: 'b1', questionId: 'q3', text: 'Do short', destinationType: 'SHORT_FORM', sortOrder: 0 }),
      ],
    );

    // a2 routes to q3 but the client passes q2 next — the server must reject it
    // because q2 is not the expected successor of the q1 -> q3 route.
    await expect(
      submit({
        steps: [
          { questionId: 'q1', optionIds: ['a2'] },
          { questionId: 'q2', optionIds: ['b1'] },
        ],
        consentGranted: true,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should reject a flow that never concludes with a destination', async () => {
    build(
      [
        makeQuestion('q1', 'Q1', 'single_choice', 0),
        makeQuestion('q2', 'Q2', 'single_choice', 1),
      ],
      [
        makeAnswer({ id: 'a1', questionId: 'q1', text: 'To q2', nextQuestionId: 'q2', sortOrder: 0 }),
        // q2 has options but none configured with a destination => dead end.
        makeAnswer({ id: 'b1', questionId: 'q2', text: 'To nowhere', nextQuestionId: null, sortOrder: 0 }),
      ],
    );

    await expect(
      submit({
        steps: [
          { questionId: 'q1', optionIds: ['a1'] },
          { questionId: 'q2', optionIds: ['b1'] },
        ],
        consentGranted: true,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  // ==================== Multi-branch DFS ====================

  it('should walk sibling branches in canonical (DFS) order and keep the full option union', async () => {
    // q1 (multiple_choice): a1 -> q2, a2 -> q3, a3 -> SHORT_FORM (terminal).
    // Primary = a1 -> q2 (lowest sortOrder); a2 -> q3 walked next; the
    // destination-only branch a3 is skipped by the traversal.
    build(
      [
        makeQuestion('q1', 'Q1', 'multiple_choice', 0),
        makeQuestion('q2', 'Q2', 'single_choice', 1),
        makeQuestion('q3', 'Q3', 'single_choice', 2),
      ],
      [
        makeAnswer({ id: 'a1', questionId: 'q1', text: 'To q2', nextQuestionId: 'q2', sortOrder: 0 }),
        makeAnswer({ id: 'a2', questionId: 'q1', text: 'To q3', nextQuestionId: 'q3', sortOrder: 1 }),
        makeAnswer({ id: 'a3', questionId: 'q1', text: 'Do short', destinationType: 'SHORT_FORM', sortOrder: 2 }),
        makeAnswer({ id: 'b1', questionId: 'q2', text: 'Do long', destinationType: 'LONG_FORM', sortOrder: 0 }),
        makeAnswer({ id: 'c1', questionId: 'q3', text: 'Get support', destinationType: 'SUPPORT', sortOrder: 0 }),
      ],
    );

    const result = await submit({
      steps: [
        { questionId: 'q1', optionIds: ['a1', 'a2', 'a3'] },
        { questionId: 'q2', optionIds: ['b1'] },
        { questionId: 'q3', optionIds: ['c1'] },
      ],
      consentGranted: true,
    });

    expect(result.destinationType).toBe('SUPPORT'); // last concluded terminal wins
    expect(result.recommendedAuditType).toBeNull();
    expect(result.answeredCount).toBe(3);

    const steps = savedSessions[0].answers;
    // The fork records the FULL union of selected options.
    expect(steps[0].optionIds).toEqual(['a1', 'a2', 'a3']);
    expect(steps[0].optionTexts).toEqual(['To q2', 'To q3', 'Do short']);
  });

  it('should skip pending branches that rejoin an already-answered question', async () => {
    // q1 (multiple_choice): a1 -> q2, a2 -> q3.
    // q2 (single_choice): b1 -> q1 (rejoin!) and b2 -> LONG_FORM.
    // After q2, the q1->q3 pending branch is walked; then the shared q1 subtree
    // is already accounted for.
    build(
      [
        makeQuestion('q1', 'Q1', 'multiple_choice', 0),
        makeQuestion('q2', 'Q2', 'single_choice', 1),
        makeQuestion('q3', 'Q3', 'single_choice', 2),
      ],
      [
        makeAnswer({ id: 'a1', questionId: 'q1', text: 'To q2', nextQuestionId: 'q2', sortOrder: 0 }),
        makeAnswer({ id: 'a2', questionId: 'q1', text: 'To q3', nextQuestionId: 'q3', sortOrder: 1 }),
        makeAnswer({ id: 'b1', questionId: 'q2', text: 'Back to q1', nextQuestionId: 'q1', sortOrder: 0 }),
        makeAnswer({ id: 'b2', questionId: 'q2', text: 'Do long', destinationType: 'LONG_FORM', sortOrder: 1 }),
        makeAnswer({ id: 'c1', questionId: 'q3', text: 'Nothing needed', destinationType: 'NO_ACTION', sortOrder: 0 }),
      ],
    );

    const result = await submit({
      steps: [
        { questionId: 'q1', optionIds: ['a1', 'a2'] },
        { questionId: 'q2', optionIds: ['b1'] },
        { questionId: 'q3', optionIds: ['c1'] },
      ],
      consentGranted: true,
    });

    expect(result.destinationType).toBe('NO_ACTION');
    expect(result.answeredCount).toBe(3);
    expect(result.isDuplicate).toBe(false);
  });

  it('should NOT accept a step that skips ahead of the pending branch head', async () => {
    build(
      [
        makeQuestion('q1', 'Q1', 'multiple_choice', 0),
        makeQuestion('q2', 'Q2', 'single_choice', 1),
        makeQuestion('q3', 'Q3', 'single_choice', 2),
      ],
      [
        makeAnswer({ id: 'a1', questionId: 'q1', text: 'To q2', nextQuestionId: 'q2', sortOrder: 0 }),
        makeAnswer({ id: 'a2', questionId: 'q1', text: 'To q3', nextQuestionId: 'q3', sortOrder: 1 }),
        makeAnswer({ id: 'b1', questionId: 'q2', text: 'Do long', destinationType: 'LONG_FORM', sortOrder: 0 }),
        makeAnswer({ id: 'c1', questionId: 'q3', text: 'Nothing needed', destinationType: 'NO_ACTION', sortOrder: 0 }),
      ],
    );

    // q3 is submitted before q2 concludes: q2 is still expected on the primary
    // line, so the server rejects the hop to q3.
    await expect(
      submit({
        steps: [
          { questionId: 'q1', optionIds: ['a1', 'a2'] },
          { questionId: 'q3', optionIds: ['c1'] },
        ],
        consentGranted: true,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should return the earlier result for an identical duplicate submission', async () => {
    build(
      [
        makeQuestion('q1', 'Q1', 'single_choice', 0),
        makeQuestion('q2', 'Q2', 'single_choice', 1),
      ],
      [
        makeAnswer({ id: 'a1', questionId: 'q1', text: 'Next', nextQuestionId: 'q2', sortOrder: 0 }),
        makeAnswer({ id: 'b1', questionId: 'q2', text: 'Do long', destinationType: 'LONG_FORM', sortOrder: 0 }),
      ],
    );

    const dto = {
      email: 'dup@example.com',
      steps: [
        { questionId: 'q1', optionIds: ['a1'] },
        { questionId: 'q2', optionIds: ['b1'] },
      ],
      consentGranted: true,
    } as SubmitPreAuditDto;

    const first = await submit(dto);
    expect(first.isDuplicate).toBe(false);

    existingSessions = savedSessions;
    const second = await submit(dto);
    expect(second.isDuplicate).toBe(true);
    expect(second.recommendedAuditType).toBe('LONG_FORM');
  });
});