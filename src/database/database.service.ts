import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class DatabaseService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query' | 'warn' | 'error'>
  implements OnModuleInit
{
  private readonly logger = new Logger('Prisma');

  constructor() {
    super({
      log:
        process.env.NODE_ENV !== 'production'
          ? [
              { emit: 'event', level: 'query' },
              { emit: 'stdout', level: 'warn' },
              { emit: 'stdout', level: 'error' },
            ]
          : [],
    });
  }

  async onModuleInit() {
    this.$on('query', (e) => {
      this.logger.debug(
        `Query: ${e.query}\nParams: ${e.params}\nDuration: ${e.duration}ms`,
      );
    });

    await this.$connect();
  }
}
