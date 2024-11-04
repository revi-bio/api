import { Module } from '@nestjs/common';
import { Auth } from './auth';
import { AuthController } from './auth.controller';

@Module({
  providers: [Auth],
  controllers: [AuthController]
})
export class AuthModule {}
