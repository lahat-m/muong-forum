// src/mail/mail.module.ts
import { Module } from '@nestjs/common';
import { MailerService } from './mail.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}