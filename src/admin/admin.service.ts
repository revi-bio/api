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
        

        await this.bioModel.deleteMany({ user: user._id });
        
        await this.messageModel.deleteMany({ user: user._id });

        await this.userModel.findByIdAndDelete(userId);
    }

    async verifyUser(userId: string): Promise<void> {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.validations && Array.isArray(user.validations)) {
            user.validations = user.validations.filter(validation => !validation.emailVerification);
        }

        await user.save();

        return;
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

    async getAllBios(): Promise<any[]> {
        const dbBioList = await this.bioModel.find().exec();
            
        const formattedData = dbBioList.map((bio) => {
        const { _id, _schemaVersion, __v, pages, ...data } = bio.toJSON();
        const widgets = Array.isArray(pages)
        ? pages.reduce((total, page: { widgets?: any[] }) => total + (page.widgets?.length || 0), 0): 0;
        return { ...data, views: 0, widgetsCount: widgets, pagesCount: pages.length };
            });
        return formattedData;
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

    async addBadgeToUsers(badgeName: string, badgeIcon: string, users: string[]){
        
        users.forEach(async userId => {
            const user = await this.userModel.findById(userId);
            user.badges.push({
                name: badgeName,
                icon: badgeIcon
            })
        });
        return;
    }
}
