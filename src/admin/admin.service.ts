import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from 'src/types/schema/User';
import * as argon2 from 'argon2';
import { InjectModel } from '@nestjs/mongoose';
import { Collections } from 'src/types/Collections';
import { JwtData } from 'src/types/JwtData';
import { v4 as uuidv4 } from 'uuid';
import { Bio, BioDocument } from 'src/types/schema/Bio';
import { Message, MessageDocument } from 'src/types/schema/Message';

@Injectable()
export class AdminService {
    constructor(
        @InjectModel(Collections.User) private readonly userModel: Model<User>,
        @InjectModel(Collections.Bio) private readonly bioModel: Model<Bio>,
        @InjectModel(Collections.Message) private readonly messageModel: Model<Message>
    ){}

    async getAllUsers(): Promise<UserDocument[]> {
        return await this.userModel.find().exec();
    }

    async deleteUser(userId: string): Promise<void> {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        
        // Delete user's bios
        await this.bioModel.deleteMany({ user: user._id });
        
        // Delete user's messages
        await this.messageModel.deleteMany({ user: user._id });
        
        // Delete the user
        await this.userModel.findByIdAndDelete(userId);
    }


    async getUserBios(userId: string): Promise<BioDocument[]> {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        
        return await this.bioModel.find({ user: user._id }).exec();
    }


    async deleteBio(bioId: string): Promise<void> {
        const bio = await this.bioModel.findById(bioId);
        if (!bio) {
            throw new NotFoundException('Bio not found');
        }
        
        await this.bioModel.findByIdAndDelete(bioId);
    }

    /**
     * Get all bios in the system
     */
    async getAllBios(): Promise<BioDocument[]> {
        return await this.bioModel.find().exec();
    }


    async sendMessageToUser(userId: string, title: string, text: string): Promise<MessageDocument> {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        
        const message = new this.messageModel({
            title,
            text,
            user: user._id,
            isRead: false
        });
        
        await message.save();
        return message;
    }

    async sendMessageToAllUsers(title: string, text: string): Promise<number> {
        const users = await this.userModel.find().exec();
        
        const messages = [];
        for (const user of users) {
            const message = new this.messageModel({
                title,
                text,
                user: user._id,
                isRead: false
            });
            messages.push(message);
        }
        
        if (messages.length > 0) {
            await this.messageModel.insertMany(messages);
        }
        
        return messages.length;
    }
}
