import { Module } from '@nestjs/common';
import { BioService } from './bio.service';
import { BioController } from './bio.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Collections } from 'src/types/Collections';
import { BioSchema } from 'src/types/schema/Bio';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Collections.Bio, schema: BioSchema },
    ]),
    UserModule,
  ],
  providers: [BioService],
  controllers: [BioController]
})
export class BioModule { }
