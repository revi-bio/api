import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './user.validation';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
    ) {}

    @Post('register')
    async register(@Body() body: RegisterUserDto) {
        const dbUser = await this.userService.createUser({
            displayName: body.displayName,
            email: body.email,
            password: body.password
        });

        // TODO: call login action when register finishes, return JWT
    }
}
