import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { MyLoggerService } from './my-logger/my-logger.service';
// import { AllExceptionFilter } from './all-exceptions.filter';
import { ExceptionsFilter } from './common/exceptions.filter';
dotenv.config();
import { winstonConfig } from './logger/winston.config';
import { WinstonModule } from 'nest-winston';
import { ErrorFilter } from './common/error.filter';
import { Reflector } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    { logger: WinstonModule.createLogger(winstonConfig) },
    // {
    // bufferLogs: true
    // }
  );

  // const { httpAdapter } = app.get(HttpAdapterHost);
  // app.useGlobalFilters(new ExceptionsFilter());
  // app.useGlobalFilters(new ErrorFilter());

  // app.useStaticAssets(join(__dirname, '..', 'uploads'));
  // app.useLogger(app.get(MyLoggerService))
  app.enableCors(); // The current setting allows all origins to acces your API (not recommended for production environments)
  app.setGlobalPrefix('api'); // Global prefix
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
