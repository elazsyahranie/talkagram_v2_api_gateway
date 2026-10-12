import {
  Inject,
  Controller,
  Post,
  HttpCode,
  UploadedFiles,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import {
  // AnyFilesInterceptor,
  // FileFieldsInterceptor,
  // FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import FormData from 'form-data';
import * as dotenv from 'dotenv';
import { HttpService } from '@nestjs/axios';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { UploadChatImagesDto } from './dto/upload-image.dto';

@Controller('media')
export class MediaController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly httpService: HttpService,
  ) {}

  @Post('/images/chat')
  @HttpCode(201)
  @UseInterceptors(FilesInterceptor('images', 10))
  async uploadChatImages(
    @Body() request: UploadChatImagesDto,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    // console.dir(request, { depth: null });
    // console.dir(image, { depth: null });

    if (images.length) {
      const formData = new FormData();
      images.forEach((image) => {
        formData.append('images', image.buffer, image.originalname);
      });
    }

    return { request };
  }
}
