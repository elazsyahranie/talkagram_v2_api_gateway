import { IsString } from 'class-validator';

export class UploadChatImagesDto {
  @IsString()
  room: string;

  @IsString()
  chat: string;
}
