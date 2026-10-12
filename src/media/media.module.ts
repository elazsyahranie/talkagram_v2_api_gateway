import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [MediaController],
})
export class MediaModule {}
