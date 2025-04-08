import { Body, Controller, ForbiddenException, Get, Patch, Post, UnauthorizedException, UploadedFile, ImATeapotException, UseInterceptors, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { CurrentUser } from './user.decorator';
import { JwtData } from 'src/types/JwtData';
import { FileService } from 'src/file/file.service';
import { ChangeDisplayNameDto, ChangePasswordDto, EmailChangeDto } from './user.validation';
import * as argon2 from 'argon2';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly fileService: FileService,
    ) { }

    @Get('@me')
    async selfInfo(@CurrentUser() currentUser: JwtData) {
        const dbUser = await this.userService.findById(currentUser.id);
        const { _id, _schemaVersion, __v, password, ...data } = dbUser.toJSON();

        return data;
    }

    @Get(':username')
    async getInfo() { }

    @Patch('email')
    async changeEmail(@Body() body: EmailChangeDto, @CurrentUser() currentUser: JwtData) {
        const dbUser = await this.userService.fromJwtData(currentUser);
        if (!await argon2.verify(dbUser.password, body.currentPassword))
            throw new ForbiddenException();

        dbUser.email = body.email;

        await dbUser.save();
    }

    @Patch('password')
    async changePassword(@Body() body: ChangePasswordDto, @CurrentUser() currentUser: JwtData) {
        const dbUser = await this.userService.fromJwtData(currentUser);
        if (!await argon2.verify(dbUser.password, body.currentPassword))
            throw new ForbiddenException();

        dbUser.password = await argon2.hash(body.password);

        await dbUser.save();
    }

    @Patch('displayname')
    async changeDisplayName(@Body() body: ChangeDisplayNameDto, @CurrentUser() currentUser: JwtData) {
        const dbUser = await this.userService.fromJwtData(currentUser);
        dbUser.displayName = body.displayName;

        await dbUser.save();
    }

    @Patch('avatar')
    @UseInterceptors(FileInterceptor('file'))
    async changeAvatar(@UseInterceptors(FileInterceptor('file')) file: Express.Multer.File, @CurrentUser() currentUser: JwtData) {
        if (!file) throw new ImATeapotException();

        const dbFile = await this.fileService.uploadFile(file, 'avatar');
        const dbUser = await this.userService.fromJwtData(currentUser);
        dbUser.avatar = dbFile;
        await dbUser.save();

        return dbFile;
    }

    @Delete('avatar')
    async deleteAvatar(@CurrentUser() currentUser: JwtData) {
        const dbUser = await this.userService.fromJwtData(currentUser);
        dbUser.avatar = undefined;

        await dbUser.save();
    }
}
