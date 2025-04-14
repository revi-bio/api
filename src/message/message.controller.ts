import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { MessageService } from './message.service';
import { UserService } from 'src/user/user.service';
import { CreateMessageDto } from './message.validation';
//import { UpdateMessageDto } from './message.validation';
import { JwtData } from 'src/types/JwtData';
import { CurrentUser } from 'src/user/user.decorator';
import { Types } from 'mongoose';

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

    //const { _id, _schemaVersion, __v, ...data } = dbMessage.toObject();
  }
}
