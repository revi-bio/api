import { Body, Controller, Delete, Get, Param, Post, UnauthorizedException, UseGuards, InternalServerErrorException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/user/user.decorator';
import { UserDocument } from 'src/types/schema/User';
import { SendMessageDto } from './admin.validation';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
    constructor(private readonly adminService: AdminService) {}
    private checkAdmin(user: UserDocument) {
        if (!user) {
            throw new UnauthorizedException('User not found in request');
        }
        
        if (user.role !== 'admin') {
            throw new UnauthorizedException('Admin access required');
        }
    }

    @Get('users')
    async getAllUsers(@CurrentUser() user: UserDocument) {
        try {
            this.checkAdmin(user);
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

    @Delete('users/:userId')
    async deleteUser(@CurrentUser() user: UserDocument, @Param('userId') userId: string) {
        this.checkAdmin(user);
        await this.adminService.deleteUser(userId);
        return { success: true, message: 'User deleted successfully' };
    }

    @Get('users/:userId/bios')
    async getUserBios(@CurrentUser() user: UserDocument, @Param('userId') userId: string) {
        this.checkAdmin(user);
        return await this.adminService.getUserBios(userId);
    }

    @Delete('bios/:bioId')
    async deleteBio(@CurrentUser() user: UserDocument, @Param('bioId') bioId: string) {
        this.checkAdmin(user);
        await this.adminService.deleteBio(bioId);
        return { success: true, message: 'Bio deleted successfully' };
    }

    /**
     * Get all bios in the system
     */
    @Get('bios')
    async getAllBios(@CurrentUser() user: UserDocument) {
        this.checkAdmin(user);
        return await this.adminService.getAllBios();
    }

    @Post('users/:userId/messages')
    async sendMessageToUser(
        @CurrentUser() user: UserDocument,  
        @Param('userId') userId: string,
        @Body() messageData: SendMessageDto
    ) {
        this.checkAdmin(user);
        const message = await this.adminService.sendMessageToUser(
            userId,
            messageData.title,
            messageData.text
        );
        return { success: true, message: 'Message sent successfully', data: message };
    }
    
    @Post('messages/broadcast')
    async sendMessageToAllUsers(
        @CurrentUser() user: UserDocument,
        @Body() messageData: SendMessageDto
    ) {
        this.checkAdmin(user);
        const count = await this.adminService.sendMessageToAllUsers(
            messageData.title,
            messageData.text
        );
        return { success: true, message: `Message sent to ${count} users`, count };
    }
}
