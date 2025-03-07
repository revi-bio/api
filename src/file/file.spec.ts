import { Test, TestingModule } from '@nestjs/testing';
import { FileService } from './file.service';

describe('File', () => {
  let provider: FileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileService],
    }).compile();

    provider = module.get<FileService>(FileService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
