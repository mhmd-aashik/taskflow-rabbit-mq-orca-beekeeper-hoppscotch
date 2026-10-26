import { Injectable, Logger } from '@nestjs/common';
import nodemailer, { type Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? 'localhost',
      port: Number(process.env.SMTP_PORT ?? 1025),
      secure: false,
    });
  }

  async sendTaskCreatedEmail(to: string, title: string): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM ?? 'notifications@taskflow.local',
      to,
      subject: 'TaskFlow - New Task Created',
      text: `A new task "${title}" has been created successfully.`,
    });

    this.logger.log(`Task notification email sent to ${to}`);
  }
}
