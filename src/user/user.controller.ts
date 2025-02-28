import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from './user.decorator';
import { JwtData } from 'src/types/JwtData';
import { ChangeDisplayNameDto, EmailChangeDto } from './user.validation';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
    ) {}

    @Get('@me')
    async selfInfo(@CurrentUser() currentUser: JwtData) {
        const dbUser = await this.userService.findById(currentUser.id);
        const { _id, _schemaVersion, password, ...data } = dbUser.toJSON();

        return data;
    }

    @Get(':username')
    async getInfo() {}
    
    @Patch('change-email')
    async changeEmail(@Body() body: EmailChangeDto, @CurrentUser() currentUser: JwtData) {
        const dbUser = await this.userService.fromJwtData(currentUser);
        dbUser.email = body.email;

        await dbUser.save();
    }

    @Patch('change-name')
    async changeDisplayName(@Body() body: ChangeDisplayNameDto, @CurrentUser() currentUser: JwtData) {
        const dbUser = await this.userService.fromJwtData(currentUser);
        dbUser.displayName = body.displayName;

        await dbUser.save();
    }
}
