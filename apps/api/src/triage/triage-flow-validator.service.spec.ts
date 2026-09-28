import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { TriageFlowValidatorService } from './triage-flow-validator.service';
import { TriageQuestion } from './entities/triage-question.entity';
import { TriageAnswer } from './entities/triage-answer.entity';

describe('TriageFlowValidatorService', () => {
  let service: TriageFlowValidatorService;
  let mockQuestionRepo: any;
  let mockAnswerRepo: any;

  beforeEach(async () => {
    mockQuestionRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
    };
    mockAnswerRepo = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TriageFlowValidatorService,
        { provide: getRepositoryToken(TriageQuestion), useValue: mockQuestionRepo },
        { provide: getRepositoryToken(TriageAnswer), useValue: mockAnswerRepo },
      ],
    }).compile();

    service = module.get<TriageFlowValidatorService>(TriageFlowValidatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateDestination', () => {
    it('throws when neither nextQuestion nor destination is provided', async () => {
      await expect(
        service.validateDestination({}, 'q-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws when both nextQuestion and destinationType are provided', async () => {
      await expect(
        service.validateDestination(
          { nextQuestionId: 'q-2', destinationType: 'SHORT_FORM' },
          'q-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws when answer points to its own owning question', async () => {
      mockQuestionRepo.findOne.mockResolvedValue({ id: 'q-1' });
      await expect(
        service.validateDestination({ nextQuestionId: 'q-1' }, 'q-1'),
      ).rejects.toThrow('An answer cannot point back to the question it belongs to.');
    });

    it('returns normalized destination for valid nextQuestionId', async () => {
      mockQuestionRepo.findOne.mockResolvedValue({ id: 'q-2' });
      const res = await service.validateDestination({ nextQuestionId: 'q-2' }, 'q-1');
      expect(res).toEqual({
        nextQuestionId: 'q-2',
        auditType: null,
        destinationType: null,
        destinationTarget: null,
      });
    });

    it('returns normalized destination for valid terminal audit type', async () => {
      const res = await service.validateDestination({ destinationType: 'LONG_FORM' }, 'q-1');
      expect(res).toEqual({
        nextQuestionId: null,
        auditType: 'LONG_FORM',
        destinationType: 'LONG_FORM',
        destinationTarget: null,
      });
    });
  });
});
