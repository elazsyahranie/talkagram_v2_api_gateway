import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ValidationService } from './validation.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { APP_FILTER } from '@nestjs/core';
import { ExceptionsFilter } from './exceptions.filter';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [
    // PrismaService,
    ValidationService,
    // { provide: APP_FILTER, useClass: ErrorFilter },
    {
      provide: APP_FILTER,
      useClass: ExceptionsFilter,
    },
  ],
  exports: [ValidationService],
})
export class CommonModule {}
