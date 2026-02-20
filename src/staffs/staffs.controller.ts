import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  HttpCode,
  Body,
  Param,
  Req,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { Logger } from 'winston';
import { Public } from 'src/decorators/public.decorator';
import { StaffsService } from './staffs.service';
import { Prisma } from '@prisma/client';
import { AddStaffDto } from './dto/add-staff.dto';

@Controller('staffs')
export class StaffsController {
  constructor(private readonly staffsService: StaffsService) {}
  @Post()
  @HttpCode(201)
  async create(@Req() req: any, @Body() staffData: AddStaffDto) {
    const adminId = req.user.id; // The id of user that sent request to this route
    return this.staffsService.create(adminId, staffData);
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
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('order', new DefaultValuePipe('a-z')) order: string,
    @Query('keywords') keywords?: string,
    @Query('role') role?: 'Admin' | 'User',
  ) {
    //   @Query('role') role?: 'Admin' | 'User', //   @Query('keywords') keywords?: string, //   @Query('order', new DefaultValuePipe('a-z')) order: string, //   @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number, //   @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number, // }, //   limit?: number; //   page?: number; //   role?: 'Admin' | 'User'; //   keywords?: string; // query: { // @Query()
    // return 'get all success';
    return this.staffsService.findAll(page, limit, order, keywords, role);
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
