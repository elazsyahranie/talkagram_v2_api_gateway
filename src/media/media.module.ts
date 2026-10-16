import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    ClientsModule.register([
      {
        name: 'USERS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.USERS_SERVICE_HOST || 'localhost',
          port: process.env.USERS_SERVICE_PORT
            ? parseInt(process.env.USERS_SERVICE_PORT, 10)
            : 3001,
        },
      },
      {
        name: 'MEDIA_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.MEDIA_SERVICE_HOST || 'localhost',
          port: process.env.MEDIA_SERVICE_PORT
            ? parseInt(process.env.MEDIA_SERVICE_PORT, 10)
            : 3002,
        },
      },
      {
        name: 'CHATS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.CHATS_SERVICE_HOST || 'localhost',
          port: process.env.CHATS_SERVICE_PORT
            ? parseInt(process.env.CHATS_SERVICE_PORT, 10)
            : 3002,
        },
      },
    ]),
  ],
  controllers: [MediaController],
})
export class MediaModule {}
