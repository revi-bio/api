import { Test, TestingModule } from '@nestjs/testing';
import { BioService } from './bio.service';

describe('Bio', () => {
  let provider: BioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BioService],
    }).compile();

    provider = module.get<BioService>(BioService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
