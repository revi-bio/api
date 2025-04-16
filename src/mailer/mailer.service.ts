import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendEmailDto } from './mailer.interface';
import Mail from 'nodemailer/lib/mailer';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: true,
      auth: {
        user: this.configService.get<string>('mailUser'),
        pass: this.configService.get<string>('mailPassword'),
      },
    });
  }

  template(html: string, replacements: Record<string, string>) {
    return html.replace(/{(\w*)}/g, (m, key) => replacements[key] ?? '');
  }

  async sendEmail(dto: SendEmailDto) {
    const { from, recepients, subject } = dto;
    const html = dto.placeholderReplacements ? this.template(dto.html, dto.placeholderReplacements) : dto.html;

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
      const result = await this.transporter.sendMail(options);
      return result;
    } catch (error) {
      console.log('Nodemailer error:', error);
      throw new Error('Failed to send email');
    }
  }

  /* Usage Example:
    #1. Import MailerService to the desired service.
    #2. Define the DTO with required fields.
    #3. Pass the DTO to sendEmail method.

    Example Usage:

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
          placeholderReplacements: { userName, userEmail }
        };

        return await this.mailerService.sendEmail(dto);
      }
    }
  */
}
