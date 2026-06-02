import { Module } from '@nestjs/common';
import { ChatsController } from './chats.controller';
import { HttpModule } from '@nestjs/axios';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    HttpModule,
    ClientsModule.register([
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
    ]),
  ],
  controllers: [ChatsController],
})
export class ChatsModule {}
