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
  UseGuards,
} from '@nestjs/common';
import { Logger } from 'winston';
import { Public } from 'src/decorators/public.decorator';
import { StaffsService } from './staffs.service';
import { Prisma } from '@prisma/client';
import { AddStaffDto } from './dto/add-staff.dto';
import { IsSuperAdminGuard } from 'src/auth/issuperadmin.guard';

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

  @Get('/:id')
  @HttpCode(200)
  findByStore(
    @Req() req: any,
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('order', new DefaultValuePipe('a-z')) order: string,
    @Query('keywords') keywords?: string,
    @Query('role') role?: 'Admin' | 'User',
  ) {
    const user_id = req.user.id;
    const store_id = id;
    return this.staffsService.findAllByStoreId(
      store_id,
      user_id,
      page,
      limit,
      order,
      keywords,
      role,
    );
  }

  @Get()
  @HttpCode(200)
  @UseGuards(IsSuperAdminGuard)
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('order', new DefaultValuePipe('a-z')) order: string,
    @Query('keywords') keywords?: string,
    @Query('role') role?: 'Admin' | 'User',
  ) {
    //   @Query('role') role?: 'Admin' | 'User', //   @Query('keywords') keywords?: string, //   @Query('order', new DefaultValuePipe('a-z')) order: string, //   @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number, //   @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number, // }, //   limit?: number; //   page?: number; //   role?: 'Admin' | 'User'; //   keywords?: string; // query: { // @Query()
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
