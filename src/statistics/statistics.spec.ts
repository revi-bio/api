import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsService } from './statistics.service';

describe('Statistics', () => {
  let provider: StatisticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatisticsService],
    }).compile();

    provider = module.get<StatisticsService>(StatisticsService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
