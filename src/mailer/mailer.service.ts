import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { sendEmailDto } from './mailer.interface';
import Mail from 'nodemailer/lib/mailer';

@Injectable()
export class MailerService {
  constructor(private readonly configService: ConfigService) {}


  transportMail() {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: true,
      auth: {
        user: this.configService.get<string>('mailUser'),
        pass: this.configService.get<string>('mailPassword'),
      },
    });

    return transporter;
  }


  template(html: string, replacements: Record<string, string>) {
    return html.replace(
      /{(\w*)}/g,
      function (m, key) {
        return replacements.hasOwnProperty(key) ? replacements[key] : '';
      },
    );
  }

  async sendEmail(dto: sendEmailDto) {
    const { from, recepients, subject } = dto;
    const html =
      dto.placeholderReplacements ? this.template(dto.html, dto.placeholderReplacements) : dto.html;
    const transport = this.transportMail();

    const options: Mail.Options = {
      from: from ?? {
        name: this.configService.get<string>('appName'),
        address: this.configService.get<string>('defMailFrom'),
      },
      to: recepients,
      subject,
      html,
    };

    try {
      const result = await transport.sendMail(options);
      return result;
    } catch (error) {
      console.log('Nodemailer error:', error);
      throw new Error('Failed to send email'); 
    }
  }

  /* How to use later on:
    #1. Import the MailerService to the service you want to use it with
    #2. Set parameters for the email, these will be used in the email
    #3. Define a DTO with the necessary fields
    #4. Pass the DTO as the parameter to the sendEmail method of the MailerService

    Here's an example:

    import { Injectable } from '@nestjs/common';
    import { MailerService } from 'src/mailer/mailer.service';

    @Injectable()
    export class SettingService {
      constructor(private readonly mailerService: MailerService) {}

      async sendSettingUpdateEmail(userName: string, userEmail: string) {
        const dto = {
          from: { name: 'Admin', address: 'admin@example.com' },
          recepients: [{ name: userName, address: userEmail }],
          subject: 'Setting Update Notification',
          html: `<p>Dear {userName}, {userEmail} your settings have been updated successfully!</p>`,
          placeholderReplacements: { userName, address: userEmail }
        };

        return await this.mailerService.sendEmail(dto);
      }
    }

  */
}
