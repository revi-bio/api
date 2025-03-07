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

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
        private readonly configService: ConfigService,
        private readonly settingService: SettingService,
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
        if (!await argon2.verify(dbUser.password, password)) {
            throw new NotFoundException('no such username or password');
        }

        const jwtPayload: JwtData = {
            id: dbUser._id,
        };

        return { 
            jwt: sign(jwtPayload, this.configService.get('jwtSecret'), {
                expiresIn: this.configService.get('jwtExpiration'),
            }),
        }
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

        await this.settingService.initSettings(dbUser);

        return this.login({ email, password });
    }
}
