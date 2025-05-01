import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
	update(id: any, arg1: { isEmailVerified: boolean; verificationToken: null; tokenExpiresAt: null; }) {
		throw new Error('Method not implemented.');
	}
    async onModuleInit() {
        await this.$connect();
    }

  async onModuleDestroy() {
        await this.$disconnect();
    }

  // Add any custom methods or properties here if needed
}
