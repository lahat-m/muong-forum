// src/tasks/tasks.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  
  constructor(private prisma: PrismaService) {}
  
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredTokens() {
    this.logger.log('Cleaning up expired tokens...');
    
    const now = new Date();
    
    try {
      // Clean up expired password reset tokens
      const deletedPasswordTokens = await this.prisma.passwordResetToken.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: now } },
            { usedAt: { not: null } },
          ]
        }
      });
      
      // Clean up expired email verification tokens
      const deletedEmailTokens = await this.prisma.emailVerification.deleteMany({
        where: {
          expiresAt: { lt: now }
        }
      });
      
      this.logger.log(`Deleted ${deletedPasswordTokens.count} expired password reset tokens`);
      this.logger.log(`Deleted ${deletedEmailTokens.count} expired email verification tokens`);
      
      // Log the cleanup
      await this.prisma.auditLog.create({
        data: {
          action: 'TOKENS_CLEANUP',
          metaData: {
            passwordTokensDeleted: deletedPasswordTokens.count,
            emailTokensDeleted: deletedEmailTokens.count,
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      this.logger.error(`Error cleaning up tokens: ${error.message}`, error.stack);
    }
  }
}