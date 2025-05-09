// src/mail/mail.service.ts - Update your existing file

import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailerService {
    private transporter;

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: configService.get('MAIL_HOST'),
            port: configService.get('MAIL_PORT'),
            secure: configService.get('MAIL_SECURE') === 'true',
            auth: {
                user: configService.get('MAIL_USER'),
                pass: configService.get('MAIL_PASSWORD'),
            },
        });
    }

    async sendVerificationEmail(to: string, token: string): Promise<void> {
        const baseUrl = this.configService.get('VERIFICATION_BASE_URL');
        const verificationUrl = `${baseUrl}/auth/verify-email?token=${token}`;

        try {
            await this.transporter.sendMail({
                from: `"${this.configService.get('MAIL_FROM')}" <${this.configService.get('MAIL_FROM')}>`,
                to,
                subject: 'Verify Your Email',
                html: `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2>Email Verification</h2>
    <p>Hello,</p>
    <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
    <p style="text-align: center;">
      <a href="${verificationUrl}" style="
          display: inline-block;
          padding: 10px 20px;
          background-color: #007bff;
          color: #fff;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
      ">Verify Email</a>
    </p>
    <p>If you did not create an account, please ignore this email.</p>
    <p>Best regards,<br>The Team</p>
  </div>
`
            });
        } catch (error) {
            console.error('Email sending error:', error);
            throw new Error(`Failed to send verification email: ${error.message}`);
        }
    }

    /**
     * Send password reset email
     */


async sendPasswordResetEmail(to: string, resetUrl: string, expiryTime: number): Promise<void> {
  try {
      await this.transporter.sendMail({
          from: `"${this.configService.get('MAIL_FROM')}" <${this.configService.get('MAIL_FROM')}>`,
          to,
          subject: 'Reset Your Password',
          html: `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
  <h1 style="margin: 0; color: #333;">Reset Your Password</h1>
</div>
<div style="padding: 20px; border: 1px solid #f5f5f5; border-radius: 0 0 5px 5px;">
  <p>Hello,</p>
  <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
  <p>To reset your password, please click the button below:</p>
  <p style="text-align: center;">
    <a href="${resetUrl}" style="display: inline-block; background-color: #4CAF50; color: white; text-decoration: none; padding: 10px 20px; margin: 20px 0; border-radius: 4px; font-weight: bold;">Reset Password</a>
  </p>
  <p>Or copy and paste this URL into your browser:</p>
  <p style="word-break: break-all;">${resetUrl}</p>
  <p>This link will expire in ${expiryTime} minutes.</p>
  <p>If you have any questions, please contact our support team at ${this.configService.get('SUPPORT_EMAIL')}.</p>
</div>
<div style="margin-top: 20px; font-size: 12px; color: #777;">
  <p>This is an automated email. Please do not reply to this message.</p>
</div>
</div>
          `
      });
  } catch (error) {
      console.error('Email sending error:', error);
      throw new Error(`Failed to send password reset email: ${error.message}`);
  }
}
}