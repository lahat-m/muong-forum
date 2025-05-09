// src/audit/audit.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  @OnEvent('password_reset.requested')
  async handlePasswordResetRequested(payload: { 
    userId: number; 
    timestamp: Date;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      await this.logAuditEvent('PASSWORD_RESET_REQUESTED', payload.userId.toString(), {
        timestamp: payload.timestamp,
        ipAddress: payload.ipAddress,
        userAgent: payload.userAgent,
      });
    } catch (error) {
      this.logger.error(`Failed to log password reset request: ${error.message}`, error.stack);
    }
  }

  @OnEvent('password_reset.completed')
  async handlePasswordResetCompleted(payload: { 
    userId: number; 
    timestamp: Date;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      await this.logAuditEvent('PASSWORD_RESET_COMPLETED', payload.userId.toString(), {
        timestamp: payload.timestamp,
        ipAddress: payload.ipAddress,
        userAgent: payload.userAgent,
      });
    } catch (error) {
      this.logger.error(`Failed to log password reset completion: ${error.message}`, error.stack);
    }
  }

  private async logAuditEvent(action: string, userId: string, metadata: any = {}) {
    await this.prisma.auditLog.create({
      data: {
        action,
        userId,
        ipAddress: metadata.ipAddress || null,
        userAgent: metadata.userAgent || null,
        metaData: metadata,
      },
    });
  }
}