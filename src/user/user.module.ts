import { Module } from '@nestjs/common';
import { User } from './user';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/types/schema/User';
import { Collections } from 'src/types/Collections';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Collections.Users, schema: UserSchema }])
  ],
  providers: [User],
  controllers: [UserController]
})
export class UserModule {}
