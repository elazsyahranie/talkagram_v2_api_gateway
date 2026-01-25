import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  HttpCode,
  Body,
  Req,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import {
  // AnyFilesInterceptor,
  FileFieldsInterceptor,
  // FileInterceptor,
} from '@nestjs/platform-express';
import { multerImageConfig } from 'src/file-upload.util';
import { Public } from 'src/decorators/public.decorator';
import { Prisma } from '@prisma/client';
import { StoresService } from './stores.service';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}
  @Post('/create')
  @HttpCode(201)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'profile', maxCount: 1 },
        { name: 'header', maxCount: 1 },
      ],
      multerImageConfig('images', 'image'),
    ),
  )
  async create(
    @Req() req: any,
    @Body() storeData: Prisma.StoresCreateInput,
    @UploadedFiles()
    files: {
      profile?: Express.Multer.File[];
      header?: Express.Multer.File[];
    },
  ) {
    const user_id = req.user.id;
    return this.storesService.create(
      storeData,
      user_id,
      files.profile ? files.profile[0] : undefined,
      files.header ? files.header[0] : undefined,
    );
  }

  @Get('/store-detail')
  @HttpCode(200)
  @Public()
  getProfile() {
    return 'get store detail';
  }

  @Get()
  @HttpCode(200)
  @Public()
  findAll() {
    //   @Query('role') role?: 'Admin' | 'User', //   @Query('keywords') keywords?: string, //   @Query('order', new DefaultValuePipe('a-z')) order: string, //   @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number, //   @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number, // }, //   limit?: number; //   page?: number; //   role?: 'Admin' | 'User'; //   keywords?: string; // query: { // @Query()
    return 'get all success';
    //   return this.usersService.findAll(page, limit, order, keywords, role);
  }

  @Patch()
  @Public()
  @HttpCode(200)
  // @UseInterceptors(
  //   AnyFilesInterceptor(),
  //   FileInterceptor('profile', multerImageConfig('images', 'image')),
  //   FileInterceptor('header', multerImageConfig('images', 'image')),
  // )
  update() {
    return 'success update';
  }

  @Delete()
  @Public()
  @HttpCode(200)
  // @UseInterceptors(
  //   AnyFilesInterceptor(),
  //   FileInterceptor('profile', multerImageConfig('images', 'image')),
  //   FileInterceptor('header', multerImageConfig('images', 'image')),
  // )
  delete() {
    return 'success delete';
  }
}
