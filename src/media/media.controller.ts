import {
  Inject,
  Controller,
  Post,
  HttpCode,
  UploadedFiles,
  UseInterceptors,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  // AnyFilesInterceptor,
  // FileFieldsInterceptor,
  // FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import FormData from 'form-data';
import { CurrentUser } from 'src/decorators/currentUser.decorator';
import * as dotenv from 'dotenv';
import { HttpService } from '@nestjs/axios';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { UploadChatImagesDto } from './dto/upload-image.dto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError, throwError, take } from 'rxjs';
import {
  MEDIA_SERVICE_HTTP_URL,
  MEDIA_SERVICE_UNAVAILABE_OR_CRASHED,
  USERS_SERVICE_UNAVAILABE_OR_CRASHED,
} from 'src/common/constants';

@Controller('media')
export class MediaController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly httpService: HttpService,
    @Inject('CHATS_SERVICE') private readonly chatClient: ClientProxy,
    @Inject('USERS_SERVICE') private readonly userClient: ClientProxy,
  ) {}

  @Post('/images/chat')
  @HttpCode(201)
  @UseInterceptors(FilesInterceptor('images', 10))
  async uploadChatImages(
    @Body() request: UploadChatImagesDto,
    @UploadedFiles() images: Express.Multer.File[],
    @CurrentUser()
    user: {
      id: string;
      // email: string
    },
  ) {
    // console.dir(request, { depth: null });
    // console.dir(image, { depth: null });

    /* 
      1) Buat dulu chat nya, tambahkan type 'image', dan isi 'chat' nya kosong.
         Kirim data 'room_id' dan 'userId' 
      2) Nanti sudah dapat ID room dan chat nya, baru kita upload gambarnya beserta ID dari chat nya
    */

    /* 
      GANTI AJA CARANYA PAKAI YANG INI 
      1) Kirim dulu file nya, nanti function nya akan return ID 
      2) Lewat SocketIO, user akan mengirim kan ID dari gambar atau media beserta chat_id nya
      3) Lalu di Media Service, akan kita tambahkan ID chat dari gambar yang terkirim tersebut pada gambar atau file yang terkirim

      Nah, kalau file nya tidak jadi dikirim, bisa saja:
      1) User langsung menghapus file tersebut (jadi kita bisa menambahkan kolom 'uploader' pada table gambar/file)
      2) Kita buatkan Cron Job atau background worker untuk menghapus gambar-gambar yang memang tidak ada data uploader atau chat_id nya
    */

    /* 
      We make the 'chat' as empty string as of now,
      since we currenty need a chat_id for the image
      data
    */
    // const result = await firstValueFrom(
    //   this.chatClient
    //     .send(
    //       { cmd: 'addChat' },
    //       { room: request.room, sender: user.id, chat: '' },
    //     )
    //     .pipe(
    //       timeout(5000),
    //       catchError((error) => {
    //         return throwError(
    //           () =>
    //             new HttpException(
    //               error.message || USERS_SERVICE_UNAVAILABE_OR_CRASHED,
    //               error.code || HttpStatus.SERVICE_UNAVAILABLE,
    //             ),
    //         );
    //       }),
    //     ),
    // );

    if (images.length) {
      const formData = new FormData();
      images.forEach((image) => {
        formData.append('images', image.buffer, image.originalname);
      });
    }

    return { status: 'success' };
  }
}
