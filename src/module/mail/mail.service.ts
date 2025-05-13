// src/mail/mail.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const user = this.configService.get<string>('email.user');
    const pass = this.configService.get<string>('email.pass');

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    const from = this.configService.get<string>('email.user');
    await this.transporter.sendMail({ from, to, subject, html });
    // subject: tiêu đề mail
    // html: nội dung email dạng html
  }
}
