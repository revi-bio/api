import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { MessageService } from './message.service';
import { UserService } from 'src/user/user.service';
import { CreateMessageDto } from './message.validation';
//import { UpdateMessageDto } from './message.validation';
import { Types } from 'mongoose';
import { CurrentUser } from 'src/user/user.decorator';
import { JwtData } from 'src/types/JwtData';

@Controller('message')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly userService: UserService
  ) {}

  @Post()
  async createMessage(@Body() body: CreateMessageDto) {
    const { title, text, userId } = body;
    const dbUser = await this.userService.findById(new Types.ObjectId(userId));

    if (!dbUser) {
      throw new NotFoundException('User not found');
    }

    const dbMessage = await this.messageService.createMessage({
      title,
      text,
      user: dbUser,
    });
    
    const { _id, _schemaVersion, __v, ...data } = dbMessage.depopulate('user').toJSON();

    return data;
  }

  @Get()
  async getMessages(@CurrentUser() currentUser: JwtData) {
    const dbUser = await this.userService.fromJwtData(currentUser);

    if (!dbUser) {
      throw new NotFoundException('User not found');
    }

    const dbMessages = await this.messageService.findByUser(dbUser);

    if (!dbMessages) {
      throw new NotFoundException('Messages not found');
    }

    const formattedData = dbMessages.map(message => {
      const {  _schemaVersion, __v, ...data } = message.toJSON();

      return { ...data};
    });

    return formattedData;
  }

  @Delete(':id')
  async deleteMessage(@Param('id') id: string) {
    const dbMessage = await this.messageService.deleteMessage(id);

    if (!dbMessage) {
      throw new NotFoundException('Message not found');
    }

    return {
      status: 200,
      message: 'Message successfully deleted',
    };
  }

  @Patch(':id')
  async markAsRead(@Param('id') id: string) {
    const dbMessage = await this.messageService.findById(new Types.ObjectId(id));

    if (!dbMessage) {
      throw new NotFoundException('Message not found');
    }

    const updatedMessage = await this.messageService.markAsRead(dbMessage.user, dbMessage);

    const { _id, _schemaVersion, __v, ...data } = updatedMessage.toJSON();

    return data;
  }
}
