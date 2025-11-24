import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { MyLoggerService } from './my-logger/my-logger.service';
// import { AllExceptionFilter } from './all-exceptions.filter';
import { ExceptionsFilter } from './common/exceptions.filter';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    // {
    // bufferLogs: true
    // }
  );

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new ExceptionsFilter(httpAdapter));

  // app.useLogger(app.get(MyLoggerService))
  app.enableCors(); // The current setting allows all origins to acces your API (not recommended for production environments)
  app.setGlobalPrefix('api'); // Global prefix
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
