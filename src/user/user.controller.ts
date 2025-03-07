import { Body, Controller, ForbiddenException, Get, Patch, Post, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from './user.decorator';
import { JwtData } from 'src/types/JwtData';
import { ChangeDisplayNameDto, ChangePasswordDto, EmailChangeDto } from './user.validation';
import * as argon2 from 'argon2';

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
        if (!await argon2.verify(dbUser.password, body.currentPassword))
            throw new ForbiddenException();

        dbUser.email = body.email;

        await dbUser.save();
    }

    @Patch('change-password')
    async changePassword(@Body() body: ChangePasswordDto, @CurrentUser() currentUser: JwtData) {
        const dbUser = await this.userService.fromJwtData(currentUser);
        if (!await argon2.verify(dbUser.password, body.currentPassword))
            throw new ForbiddenException();

        dbUser.password = await argon2.hash(body.password);

        await dbUser.save();
    }

    @Patch('change-displayname')
    async changeDisplayName(@Body() body: ChangeDisplayNameDto, @CurrentUser() currentUser: JwtData) {
        const dbUser = await this.userService.fromJwtData(currentUser);
        dbUser.displayName = body.displayName;

        await dbUser.save();
    }
}
