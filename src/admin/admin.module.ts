import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Collections } from 'src/types/Collections';
import { UserSchema } from 'src/types/schema/User';
import { BioSchema } from 'src/types/schema/Bio';
import { MessageSchema } from 'src/types/schema/Message';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Collections.User, schema: UserSchema },
      { name: Collections.Bio, schema: BioSchema },
      { name: Collections.Message, schema: MessageSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
