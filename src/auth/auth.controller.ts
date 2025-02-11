import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { LoginUserDto, RegisterUserDto } from './auth.validation';
import * as argon2 from 'argon2';
import { sign, verify } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
        private readonly configService: ConfigService,
    ) {}

    @Public()
    @Post('login')
    async login(@Body() body: LoginUserDto) {
        const { email, password } = body;

        const dbUser = await this.userService.getFindOne()({ email });

        if (!dbUser) {
            throw new HttpException('no such username or password', HttpStatus.FORBIDDEN);
        }
        
        if (!argon2.verify(dbUser.password, password)) {
            // passwords don't match
            throw new HttpException('no such username or password', HttpStatus.FORBIDDEN);
        }

        const jwtPayload = {
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

        await this.userService.createUser({
            displayName,
            email,
            password,
        });

        return this.login({ email, password });
        // TODO: call login action when register finishes, return JWT
    }
}
