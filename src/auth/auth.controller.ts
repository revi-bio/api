import { Body, Controller, HttpException, HttpStatus, Post, HttpCode, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { LoginUserDto, RegisterUserDto } from './auth.validation';
import * as argon2 from 'argon2';
import { sign, verify } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { Public } from './public.decorator';
import { JwtData } from 'src/types/JwtData';
import { SettingService } from 'src/setting/setting.service';
import { MailerService } from 'src/mailer/mailer.service';
import { readFileSync } from 'fs';
import { join } from 'path';
import { MessageService } from 'src/message/message.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly settingService: SettingService,
    private readonly mailerService: MailerService,
    private readonly messageService: MessageService,
  ) {}

  @Public()
  @HttpCode(200)
  @Post('login')
  async login(@Body() body: LoginUserDto) {
    const { email, password } = body;

    const dbUser = await this.userService.findByEmail(email);

    if (!dbUser) {
      throw new NotFoundException('no such username or password');
    }

    // passwords don't match
    if (!(await argon2.verify(dbUser.password, password))) {
      throw new NotFoundException('no such username or password');
    }
    
    if (dbUser.validations.filter((v) => v.emailVerification).length) {
      throw new NotFoundException('unconfirmed email address');
    }

    const jwtPayload: JwtData = {
      id: dbUser._id,
    };

    return {
      jwt: sign(jwtPayload, this.configService.get('jwtSecret'), {
        expiresIn: this.configService.get('jwtExpiration'),
      }),
    };
  }

  @Public()
  @Post('register')
  async register(@Body() body: RegisterUserDto) {
    const { displayName, email, password } = body;

    const dbUser = await this.userService.createUser({
      displayName,
      email,
      password,
    });

    await this.messageService.createMessage({title: 'Welcome! 🎉', text: "Thank you for registering with us! We're excited to have you as part of our community. Your account has been successfully created, and you're now ready to explore everything we have to offer. \nIf you have any questions or need assistance, feel free to reach out — we're here to help!", user: dbUser})

    const route = this.configService.get('frontendRoot') + `/email-verification/${dbUser.validations[0].emailVerification}`;
    await this.settingService.initSettings(dbUser);

    const htmlTemplate = readFileSync(join(__dirname, '..', '..', 'assets', 'templates', 'verification.html'), 'utf8');

    await this.mailerService.sendEmail({
      from: {
        name: this.configService.get<string>('appName'),
        address: this.configService.get<string>('defMailFrom'),
      },
      recepients: [{ name: 'user', address: email }],
      subject: 'Welcome to our platform!',
      html: htmlTemplate,
      placeholderReplacements: {
        emailVerification: route,
      },
    });

    return this.login({ email, password });
  }
}
