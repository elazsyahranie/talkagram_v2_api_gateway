import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { MyLoggerService } from './my-logger/my-logger.service';
import { AllExceptionFilter } from './all-exceptions.filter';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    // {
    // bufferLogs: true
    // }
  );

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionFilter(httpAdapter)); 
  /* 
    1) Masih harus diperiksa kenapa file untuk menyimpan log nya tidak muncul 
    2) Tambahkan exception lain, misalkan kalau data tidak ada kirimkan error, atau kalau email sudah ada kirimkan error
  */

  // app.useLogger(app.get(MyLoggerService))
  app.enableCors(); // The current setting allows all origins to acces your API (not recommended for production environments)
  app.setGlobalPrefix('api'); // Global prefix
  await app.listen(process.env.PORT ?? 3000);
  // console.log(process.env.DATABASE_URL)
  // console.log(`Listening to port ${process.env.PORT}`)
}
bootstrap();
