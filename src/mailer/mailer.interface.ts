import { Address } from "nodemailer/lib/mailer"

export type sendEmailDto = {
    from?: Address,
    recepients: Address[],
    subject: string,
    html: string,
    text?: string,
    placeholderReplacements?: Record<string,string>;
}