import { NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';

describe('AdminService settings & help resources', () => {
  const repo = (overrides: Record<string, jest.Mock> = {}) => ({
    findOne: jest.fn(),
    create: jest.fn((value) => value),
    save: jest.fn(async (value) => value),
    find: jest.fn(async () => []),
    delete: jest.fn(async () => ({ affected: 1 })),
    ...overrides,
  });

  const makeService = () => {
    const settingsRepo = repo();
    const helpRepo = repo();
    const service = new AdminService(
      repo() as any,
      repo() as any,
      repo() as any,
      settingsRepo as any,
      helpRepo as any,
    );
    return { service, settingsRepo, helpRepo };
  };

  it('creates and saves a default settings row when none exists', async () => {
    const { service, settingsRepo } = makeService();
    settingsRepo.findOne.mockResolvedValue(null);

    const result = await service.getSettings();
    expect(settingsRepo.create).toHaveBeenCalledWith({ id: 'app' });
    expect(result.id).toBe('app');
  });

  it('returns the existing settings row', async () => {
    const { service, settingsRepo } = makeService();
    settingsRepo.findOne.mockResolvedValue({ id: 'app', platformName: 'My Platform' });
    expect((await service.getSettings()).platformName).toBe('My Platform');
  });

  it('merges settings updates and ignores undefined values', async () => {
    const { service, settingsRepo } = makeService();
    settingsRepo.findOne.mockResolvedValue({ id: 'app', platformName: 'Old', supportEmail: null });

    await service.updateSettings({ platformName: 'New' });
    const saved = (await settingsRepo.save.mock.calls[0][0]) as any;
    expect(saved.platformName).toBe('New');
    expect(saved.supportEmail).toBeNull();
  });

  it('creates a help resource with safe defaults', async () => {
    const { service, helpRepo } = makeService();
    await service.createHelpResource({ title: 'Talk to an advisor' });
    const created = helpRepo.create.mock.calls[0][0];
    expect(created).toMatchObject({ title: 'Talk to an advisor', category: 'support', sortOrder: 0, isActive: true });
  });

  it('toggles a help resource via update', async () => {
    const { service, helpRepo } = makeService();
    helpRepo.findOne.mockResolvedValue({ id: 'r1', isActive: true });
    await service.updateHelpResource('r1', { isActive: false });
    const saved = helpRepo.save.mock.calls[0][0];
    expect(saved.isActive).toBe(false);
  });

  it('throws NotFound when updating a missing help resource', async () => {
    const { service, helpRepo } = makeService();
    helpRepo.findOne.mockResolvedValue(null);
    await expect(service.updateHelpResource('nope', {})).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws NotFound when deleting a missing help resource', async () => {
    const { service, helpRepo } = makeService();
    helpRepo.delete.mockResolvedValue({ affected: 0 });
    await expect(service.deleteHelpResource('nope')).rejects.toBeInstanceOf(NotFoundException);
  });
});