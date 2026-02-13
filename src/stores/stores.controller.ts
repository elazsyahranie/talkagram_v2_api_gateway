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
  Inject,
  Param,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  ValidationPipe,
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
import { Logger } from 'winston';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Controller('stores')
export class StoresController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly storesService: StoresService,
  ) {}
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

  @Get(':id')
  @HttpCode(200)
  getDetail(@Param('id') id: string) {
    const data = this.storesService.findOne(id);
    return data;
  }

  @Get()
  @HttpCode(200)
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('order', new DefaultValuePipe('a-z')) order: string,
    @Query('keywords') keywords?: string,
  ) {
    //   @Query('role') role?: 'Admin' | 'User', //   @Query('keywords') keywords?: string, //   @Query('order', new DefaultValuePipe('a-z')) order: string, //   @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number, //   @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number, // }, //   limit?: number; //   page?: number; //   role?: 'Admin' | 'User'; //   keywords?: string; // query: { // @Query()
    return this.storesService.findAll(page, limit, order, keywords);
  }

  @Patch(':id')
  @HttpCode(200)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'profile', maxCount: 1 },
        { name: 'header', maxCount: 1 },
      ],
      multerImageConfig('images', 'image'),
    ),
  )
  update(
    @Body(new ValidationPipe({ whitelist: true }))
    updatedStore: Prisma.StoresUpdateInput,
    @UploadedFiles()
    files: {
      profile?: Express.Multer.File[];
      header?: Express.Multer.File[];
    },
    @Req() req: any,
    @Param('id') store_id: string,
  ) {
    const user_id = req.user.id;
    return this.storesService.update(
      store_id,
      user_id,
      updatedStore,
      files?.profile?.[0],
      files?.header?.[0],
    );
  }

  @Delete(':id')
  @HttpCode(200)
  delete(@Req() req: any, @Param('id') store_id: string) {
    const user_id = req.user.id;
    return this.storesService.delete(store_id, user_id);
  }
}
