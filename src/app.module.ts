import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
// import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
// import { APP_GUARD } from '@nestjs/core';
// import { MyLoggerModule } from './my-logger/my-logger.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './logger/winston.config';
// import { ExceptionsFilter } from './common/exceptions.filter';
// import { APP_FILTER } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { RedisModule } from './redis.module';
import { StoresController } from './stores/stores.controller';
import { StoresService } from './stores/stores.service';
import { HttpModule } from '@nestjs/axios';
// import { ClientsModule, Transport } from '@nestjs/microservices';
import { ChatsModule } from './chats/chats.module';

@Module({
  imports: [
    // ClientsModule.register([
    //   {
    //     name: 'USERS_SERVICE',
    //     transport: Transport.TCP,
    //     options: {
    //       host: process.env.USERS_SERVICE_HOST || 'localhost',
    //       port: process.env.USERS_SERVICE_PORT
    //         ? parseInt(process.env.USERS_SERVICE_PORT, 10)
    //         : 3001,
    //     },
    //   },
    // ]),
    UsersModule,
    DatabaseModule,
    HttpModule,
    CommonModule,
    WinstonModule.forRoot(winstonConfig),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      // rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    // ThrottlerModule.forRoot([
    //   { name: 'short', ttl: 1000, limit: 3 },
    //   { name: 'long', ttl: 60000, limit: 3 },
    // ]),
    // MyLoggerModule,
    AuthModule,
    RedisModule,
    ChatsModule,
  ],
  controllers: [AppController, StoresController],
  providers: [
    AppService,
    // { provide: APP_GUARD, useClass: ThrottlerGuard } Activates the throttle
    // {
    //   provide: APP_FILTER,
    //   useClass: ExceptionsFilter,
    // },
    StoresService,
  ],
  exports: [WinstonModule],
})
export class AppModule {}
