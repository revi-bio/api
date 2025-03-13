import { Module } from '@nestjs/common';
import { BioService } from './bio.service';
import { BioController } from './bio.controller';

@Module({
  providers: [BioService],
  controllers: [BioController]
})
export class BioModule {}
