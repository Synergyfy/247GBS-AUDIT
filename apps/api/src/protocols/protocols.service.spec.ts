import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProtocolsService } from './protocols.service';
import { NotificationSetting } from './entities/notification-setting.entity';
import { BillingProfile } from './entities/billing-profile.entity';
import { Invoice } from './entities/invoice.entity';
import { UsersService } from '../users/users.service';

describe('ProtocolsService', () => {
  let service: ProtocolsService;
  const userId = 'user-1';

  const notificationSettings = [
    { title: 'Forensic Alerts', description: 'Immediate notification of detected capacity leaks.', isActive: true },
    { title: 'Strategic Insights', description: 'Weekly AI-generated market trend analysis.', isActive: true },
  ] as NotificationSetting[];

  const notificationRepository = {
    find: jest.fn().mockImplementation(() =>
      Promise.resolve(notificationSettings),
    ),
    findOne: jest.fn().mockImplementation(({ where }: any) =>
      Promise.resolve(
        notificationSettings.find((s) => s.title === where.title) ?? null,
      ),
    ),
    save: jest.fn().mockImplementation((setting: NotificationSetting) => {
      const existing = notificationSettings.find((s) => s.title === setting.title);
      if (existing) existing.isActive = setting.isActive;
      return Promise.resolve(setting);
    }),
  };

  const billingRepository = {
    findOne: jest.fn().mockImplementation(() =>
      Promise.resolve({
        planName: 'Growth Specialist',
        price: '£500 / Month',
        last4: '4242',
        expiry: '12/27',
        invoices: [],
      } as unknown as BillingProfile),
    ),
  };

  const invoiceRepository = {};

  const usersService = {
    findById: jest.fn().mockResolvedValue({ isMfaEnabled: true, tokens: 100 }),
    update: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProtocolsService,
        { provide: getRepositoryToken(NotificationSetting), useValue: notificationRepository },
        { provide: getRepositoryToken(BillingProfile), useValue: billingRepository },
        { provide: getRepositoryToken(Invoice), useValue: invoiceRepository },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    service = module.get<ProtocolsService>(ProtocolsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return security status', async () => {
    const result = await service.getSecurityStatus(userId);
    expect(result.is2FAEnabled).toBe(true);
    expect(usersService.findById).toHaveBeenCalledWith(userId);
  });

  it('should return billing info', async () => {
    const result = await service.getBillingInfo(userId);
    expect(result.planName).toBe('Growth Specialist');
  });

  it('should update notification settings', async () => {
    const result = await service.updateNotification(userId, 'Forensic Alerts', false);
    const updated = result.find(n => n.title === 'Forensic Alerts');
    expect(updated?.active).toBe(false);
  });
});