import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ValidationService } from './validation.service';

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
  ],
  exports: [ValidationService],
})
export class CommonModule {}
