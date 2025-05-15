import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { Collections } from 'src/types/Collections';
import { Bio, BioSchema } from 'src/types/schema/Bio';
import { BioVisitContainer, BioVisitContainerSchema } from 'src/types/schema/BioView';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Collections.Bio, schema: BioSchema },
      { name: Collections.BioVisitContainer, schema: BioVisitContainerSchema },
    ]),
  ],
  providers: [StatisticsService],
  controllers: [StatisticsController],
  exports: [StatisticsService],
})
export class StatisticsModule {}
