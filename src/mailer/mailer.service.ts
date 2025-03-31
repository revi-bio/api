import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer'
import { sendEmailDto } from './mailer.interface';
import Mail from 'nodemailer/lib/mailer';
import configuration from 'src/configuration';


@Injectable()
export class MailerService {

    constructor(private readonly configService: ConfigService){}

    transportMail(){
        const transporter = nodemailer.createTransport({
            service:'gmail',
            secure: true,
            auth: {
                
                user: this.configService.get<string>('mailUser'),
                pass: this.configService.get<string>('mailPassword')
            }
        });

        return transporter;
    }

    template(html:string, replacesments: Record<string,string>){
        return html.replace(
            /{(\w*)}/g,
            function (m, key){
                return replacesments.hasOwnProperty(key) ? replacesments[key] : '';
            }
        );
    }

    async sendEmail(dto: sendEmailDto){
        const {from, recepients, subject} = dto;

        const html = dto.placeholderReplacements ? this.template(dto.html, dto.placeholderReplacements) : dto.html;
        const transport = this.transportMail();

        const options: Mail.Options ={
            from: from ??   {
                name: this.configService.get<string>("APP_NAME"),
                address: this.configService.get<string>("DEFAULT_MAIL_FROM")
            },
            to: recepients,
            subject,
            html
        }

        try{
            const result = await transport.sendMail(options);

            return result;
        }catch(error){  
            console.log("Nodemailer error:",  error)
        }   
    }
}
