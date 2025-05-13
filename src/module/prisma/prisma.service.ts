import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        super();
    }
    async onModuleInit() {
      try {
        await this.$connect();
      } catch (error) {
        console.error('Prisma connection error:', error);
      }
      }
    
      async onModuleDestroy() {
        try {
          await this.$disconnect();
        } catch (error) {
          console.error('Prisma disconnection error:', error);
        }
      }
}
