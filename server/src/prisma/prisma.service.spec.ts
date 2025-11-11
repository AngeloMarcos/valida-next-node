import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should extend PrismaClient', () => {
    expect(service).toHaveProperty('$connect');
    expect(service).toHaveProperty('$disconnect');
  });

  describe('onModuleInit', () => {
    it('should call $connect on module init', async () => {
      const connectSpy = jest.spyOn(service, '$connect').mockResolvedValue();
      await service.onModuleInit();
      expect(connectSpy).toHaveBeenCalled();
    });
  });
});
