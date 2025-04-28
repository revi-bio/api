import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { secureHeapUsed } from 'crypto';
import configuration from 'src/configuration';
import { SettingModule } from 'src/setting/setting.module';
import { MailerModule } from 'src/mailer/mailer.module';
import { MessageModule } from 'src/message/message.module';

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      global: true,
      secret: configuration().jwtSecret,
      signOptions: {
        expiresIn: '2d',
      },
    }),
    SettingModule,
    MailerModule,
    MessageModule,
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
