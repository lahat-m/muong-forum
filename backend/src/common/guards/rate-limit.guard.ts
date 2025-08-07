// src/common/guards/rate-limit.guard.ts
import {
    Injectable,
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { SetMetadata } from '@nestjs/common';
import { CacheService } from 'src/cache/cache.service';

export const RATE_LIMIT_KEY = 'rate_limit';
export const RateLimit = (options: { windowMs: number; max: number }) =>
    SetMetadata(RATE_LIMIT_KEY, options);

@Injectable()
export class RateLimitGuard implements CanActivate {
    private readonly logger = new Logger(RateLimitGuard.name);

    constructor(
        private readonly reflector: Reflector,
        private readonly cacheService: CacheService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        let rateLimitOptions = this.reflector.getAllAndOverride(RATE_LIMIT_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!rateLimitOptions) {
            // Default rate limiting: 100 requests per minute
            rateLimitOptions = { windowMs: 60000, max: 100 };
        }

        const request = context.switchToHttp().getRequest<Request>();
        const key = this.generateKey(request);

        try {
            const current = await this.getCurrentCount(key);

            if (current >= rateLimitOptions.max) {
                this.logger.warn(`Rate limit exceeded for ${key}`);
                throw new HttpException(
                    {
                        statusCode: HttpStatus.TOO_MANY_REQUESTS,
                        message: 'Too many requests',
                        error: 'Too Many Requests',
                    },
                    HttpStatus.TOO_MANY_REQUESTS,
                );
            }

            await this.incrementCount(key, rateLimitOptions.windowMs);
            return true;

        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            this.logger.error(`Rate limiting error: ${error.message}`);
            return true; // Allow request on cache errors
        }
    }

    private generateKey(request: Request): string {
        const ip = request.ip || request.connection.remoteAddress || 'unknown';
        const route = `${request.method}:${request.route?.path || request.path}`;
        return `rate_limit:${ip}:${route}`;
    }

    private async getCurrentCount(key: string): Promise<number> {
        const count = await this.cacheService.get<number>(key);
        return count || 0;
    }

    private async incrementCount(key: string, windowMs: number): Promise<void> {
        const current = await this.getCurrentCount(key);
        const ttl = Math.ceil(windowMs / 1000);
        await this.cacheService.set(key, current + 1, ttl);
    }
}
