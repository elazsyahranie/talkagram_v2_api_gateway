import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';

@Module({
  //   imports: [ChatGateway],
  providers: [ChatGateway],
  controllers: [],
})
export class ChatModule {}
