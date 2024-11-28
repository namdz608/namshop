import { config } from "@notifications/config";
import { Logger } from "winston";
import { winstonLogger, IEmailLocals } from "@namdz608/jobber-shared";
import nodemailer, { Transporter } from 'nodemailer';
import Email from 'email-templates'
import path from 'path'

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationServer', 'debug')

export async function emailTemplate(template: string, receiver: string, locals: IEmailLocals): Promise<void> {
    try {
        const smtpTransporter: Transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            auth: {
                user: config.SENDER_EMAIL,
                pass: config.SENDER_EMAIL_PASSWORD
            }
        })
        const email: Email = new Email({
            message: {
                from: `Jobber App <${config.SENDER_EMAIL}`
            },
            send: true,
            preview: false,
            transport: smtpTransporter,
            views: {
                options: {
                    extension: 'ejs'
                }
            },
            juice: true,
            juiceResources: {
                preserveImportant: true,
                webResources: {
                    relativeTo: path.join(__dirname, '../build')
                }
            }
        });


        await email.send({
            template: path.join(__dirname, '..', 'src/emails', template),
            message: { to: receiver },
            locals
        })
    } catch (e) {
        log.log('error','Notification Mail emailTemplate() method Error', e)
    }
}