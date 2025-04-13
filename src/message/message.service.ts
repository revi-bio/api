import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from 'src/types/schema/Message';
import { Model } from 'mongoose';
import { Collections } from 'src/types/Collections';
import { JwtData } from 'src/types/JwtData';

@Injectable()
export class MessageService {
    constructor(
        @InjectModel('Message') private readonly messageModel: any,
    ) {}

    async createMessage(messageData: Message): Promise<any> {
      const newMessage = new this.messageModel(messageData);
      return await newMessage.save();
    }

    async getAllMessages(): Promise<any[]> {
      return await this.messageModel.find().exec();
    }

    async getMessageById(id: string): Promise<any> {
      return await this.messageModel.findById(id).exec();
    }

    async updateMessage(id: string, messageData: any): Promise<any> {
      return await this.messageModel.findByIdAndUpdate(id, messageData, { new: true }).exec();
    }

    async deleteMessage(id: string): Promise<any> {
      return await this.messageModel.findByIdAndDelete(id).exec();
    }
    
    async markAsRead(id: string): Promise<any> {

    }
}
