import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from 'src/types/schema/Message';
import { Model, Types } from 'mongoose';
import { User } from 'src/types/schema/User';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel('Message') private readonly messageModel: Model<Message>,
  ) {}

  async findById(id: Types.ObjectId) {
    return await this.messageModel.findById(id);
  }

  async findByUser(user: User): Promise<Message[]> {
    return await this.messageModel.find({ user: user._id });
  }

  async createMessage(data: {
    title: string;
    text: string;
    user: User;
  }): Promise<Message> {
    const { title, text, user } = data;

    const dbMessage = new this.messageModel({
      title,
      text,
      user,
      isRead: false,
    });

    await dbMessage.save();

    return dbMessage;
  }

  async deleteMessage(id: string): Promise<any> {
    return await this.messageModel.findByIdAndDelete(id).exec();
  }

  async markAsRead(user: User, message: Message) {
    const dbMessage = await this.messageModel.findOne({ user: user._id, _id: message._id });
    
    if (!dbMessage) {
      throw new Error('Message not found');
    }
    
    dbMessage.isRead = true;

    await dbMessage.save();
    return dbMessage;
  }
}
