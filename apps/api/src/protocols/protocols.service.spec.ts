import { Test, TestingModule } from '@nestjs/testing';
import { ProtocolsService } from './protocols.service';

describe('ProtocolsService', () => {
  let service: ProtocolsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProtocolsService],
    }).compile();

    service = module.get<ProtocolsService>(ProtocolsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return security status', async () => {
    const result = await service.getSecurityStatus();
    expect(result.is2FAEnabled).toBe(true);
  });

  it('should return billing info', async () => {
    const result = await service.getBillingInfo();
    expect(result.planName).toBe('Growth Specialist');
  });

  it('should update notification settings', async () => {
    const result = await service.updateNotification('Forensic Alerts', false);
    const updated = result.find(n => n.title === 'Forensic Alerts');
    expect(updated?.active).toBe(false);
  });
});
