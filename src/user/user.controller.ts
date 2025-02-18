import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from './user.decorator';
import { JwtData } from 'src/types/JwtData';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
    ) {}

    @Get('@me')
    public async selfInfo(@CurrentUser() currentUser: JwtData) {
        const dbUser = await this.userService.findById(currentUser.id);
        const { _id, _schemaVersion, password, ...data } = dbUser.toJSON();

        return data;
    }

    @Get(':username')
    public async getInfo() {

    }
}
