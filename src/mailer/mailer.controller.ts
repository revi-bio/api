import { Body, Controller, Post } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { sendEmailDto } from './mailer.interface';

@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Post('send-mail')
  async sendMail(@Body() body: Record<string, string>){
    const dto: sendEmailDto ={
      from: {name: 'Ricsike', address: 'ricsike@retek.com'}, 
      recepients: [{name: 'Bezdan', address: 'bezdan@gmail.com'}],
      subject: "I can't move it move it anymore",
      html: '<p>Hi {name} I hate the king of negus who has the address {address}</p>'
    }
    return await this.mailerService.sendEmail(dto);
  }
}
