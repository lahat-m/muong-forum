// src/cache/cache.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CacheService {
    private readonly logger = new Logger(CacheService.name);
    private cache = new Map<string, { value: any; expiresAt: number }>();

    constructor(private configService: ConfigService) {
        // Cleanup expired entries every 5 minutes
        setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }

    async get<T>(key: string): Promise<T | null> {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.value;
    }

    async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
        const expiresAt = Date.now() + (ttlSeconds * 1000);
        this.cache.set(key, { value, expiresAt });
    }

    async del(key: string): Promise<void> {
        this.cache.delete(key);
    }

    async delPattern(pattern: string): Promise<void> {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        const keysToDelete = Array.from(this.cache.keys()).filter(key => regex.test(key));
        keysToDelete.forEach(key => this.cache.delete(key));
    }

    private cleanup(): void {
        const now = Date.now();
        const expiredKeys = Array.from(this.cache.entries())
            .filter(([, entry]) => now > entry.expiresAt)
            .map(([key]) => key);

        expiredKeys.forEach(key => this.cache.delete(key));

        if (expiredKeys.length > 0) {
            this.logger.debug(`Cleaned up ${expiredKeys.length} expired cache entries`);
        }
    }
}