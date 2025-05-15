import { Body, Controller, Delete, Get, Param, Post, UnauthorizedException, UseGuards, InternalServerErrorException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/user/user.decorator';
import { User, UserDocument } from 'src/types/schema/User';
import { SendMessageDto } from './admin.validation';
import { JwtData } from 'src/types/JwtData';
import { UserService } from 'src/user/user.service';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
    constructor(private readonly adminService: AdminService, private readonly userService: UserService) {}

    private async checkAdmin(currentUser: JwtData) {
        const dbUser = await this.userService.fromJwtData(currentUser);

        if (dbUser.role !== 'admin') {
            throw new UnauthorizedException('Admin access required');
        }
    }

    @Get('users')
    async getAllUsers(@CurrentUser() currentUser: JwtData) {
        
        try {
            await this.checkAdmin(currentUser);
            const users = await this.adminService.getAllUsers();
            return users;
        } catch (error) {
            console.error('Error in getAllUsers:', error);
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to fetch users');
        }
    }

    @Get('users/:userId/verify')
    async verifyUser(@CurrentUser() currentUser: JwtData, @Param('userId') userId: string) {
        this.checkAdmin(currentUser);
        await this.adminService.verifyUser(userId);
        return { success: true, message: 'User verified successfully' };
    }

    @Delete('users/:userId')
    async deleteUser(@CurrentUser() currentUser: JwtData, @Param('userId') userId: string) {
        this.checkAdmin(currentUser);
        await this.adminService.deleteUser(userId);
        return { success: true, message: 'User deleted successfully' };
    }

    @Get('users/:userId/bios')
    async getUserBios(@CurrentUser() currentUser: JwtData, @Param('userId') userId: string) {
        this.checkAdmin(currentUser);
        return await this.adminService.getUserBios(userId);
    }

    @Delete('bios/:bioId')
    async deleteBio(@CurrentUser() currentUser: JwtData, @Param('bioId') bioId: string) {
        this.checkAdmin(currentUser);
        await this.adminService.deleteBio(bioId);
        return { success: true, message: 'Bio deleted successfully' };
    }

    /**
     * Get all bios in the system
     */
    @Get('bios')
    async getAllBios(@CurrentUser() currentUser: JwtData) {
        this.checkAdmin(currentUser);
        return await this.adminService.getAllBios();
    }

    @Post('users/:userId/messages')
    async sendMessageToUser(
        @CurrentUser() currentUser: JwtData,  
        @Param('userId') userId: string,
        @Body() messageData: SendMessageDto
    ) {
        this.checkAdmin(currentUser);
        const message = await this.adminService.sendMessageToUser(
            userId,
            messageData.title,
            messageData.text
        );
        return { success: true, message: 'Message sent successfully', data: message };
    }
    
    @Post('messages/broadcast')
    async sendMessageToAllUsers(
        @CurrentUser() currentUser: JwtData,
        @Body() messageData: SendMessageDto
    ) {
        this.checkAdmin(currentUser);
        const count = await this.adminService.sendMessageToAllUsers(
            messageData.title,
            messageData.text
        );
        return { success: true, message: `Message sent to ${count} users`, count };
    }

    @Post('badge')
    async addBadgeToUsers(
        @CurrentUser() currentUser: JwtData,
        @Body() body: { badgeName: string; badgeIcon: string; users: string[] }
        ){
        const { badgeName, badgeIcon, users } = body;
        this.checkAdmin(currentUser);
        
        const badge = await this.adminService.addBadgeToUsers(
            badgeName,
            badgeIcon,
            users
        )
        return;
    }
}
