import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn().mockResolvedValue({ id: '1', firstName: 'John' }),
            update: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return user profile', async () => {
    const result = await controller.getProfile({ user: { sub: '1' } } as any);
    expect(result).toEqual({ id: '1', firstName: 'John' });
    expect(service.findById).toHaveBeenCalledWith('1');
  });

  it('should update user profile', async () => {
    const dto = { firstName: 'Jane' };
    await controller.updateProfile({ user: { sub: '1' } } as any, dto);
    expect(service.update).toHaveBeenCalledWith('1', dto);
  });
});
