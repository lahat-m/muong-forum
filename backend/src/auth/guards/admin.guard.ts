// src/auth/guards/admin.guard.ts

import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user; // Ensure JwtGuard populates the user.
        if (user && user.role === 'ADMIN') {
            return true;
        }
        throw new ForbiddenException('Access denied, admin privileges required');
    }
}
