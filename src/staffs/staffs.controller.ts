import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  HttpCode,
  Body,
} from '@nestjs/common';
import { Logger } from 'winston';
import { Public } from 'src/decorators/public.decorator';
import { StaffsService } from './staffs.service';
import { Prisma } from '@prisma/client';

@Controller('staffs')
export class StaffsController {
  constructor(private readonly staffsService: StaffsService) {}
  @Post('/create')
  @HttpCode(201)
  @Public()
  async create(@Body() staffData: Prisma.StaffsCreateInput) {
    return this.staffsService.create(staffData);
  }

  @Post('/login')
  @HttpCode(200)
  @Public()
  async login() {
    return 'login success';
  }

  @Get('/profile')
  @HttpCode(200)
  @Public()
  getProfile() {
    return 'get profile';
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
