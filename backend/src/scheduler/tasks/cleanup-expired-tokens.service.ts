// src/password-reset/middleware/password-reset-rate-limit.middleware.ts
import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class PasswordResetThrottlerGuard extends ThrottlerGuard {
  // Make getTracker async to match the parent class
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Track by IP address AND email (if provided)
    if (req.body && req.body.email) {
      return `${req.ip}-${req.body.email}`;
    }
    return req.ip;
  }
}