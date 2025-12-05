import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Patch,
  Delete,
  ValidationPipe,
  HttpCode,
  UseGuards,
  Req,
  Inject,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Prisma } from '@prisma/client';
import { LoginUserDto } from './dto/login-user.dto';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { multerImageConfig } from 'src/common/file-upload.util';

@Controller('users')
export class UsersController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly usersService: UsersService,
  ) {}
  // private readonly logger = new MyLoggerService(UsersController.name);

  @Post('/login')
  @HttpCode(200)
  async login(@Body() request: LoginUserDto) {
    const result = await this.usersService.login(request);
    return {
      data: result,
    };
  }

  @Post()
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('profile', multerImageConfig('images')))
  create(
    @Body() userData: Prisma.UsersCreateInput,
    @UploadedFile() profile: Express.Multer.File,
  ) {
    return this.usersService.create(userData); // Tinggal diteruskan untuk upload file nya ya
  }

  @Get('/profile')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  getProfile(@Req() req: any) {
    const { id } = req.user;
    this.logger.log(`Profile ${id} fetched`, 'UsersService');
    return this.usersService.findOne(id);
  }

  @Get()
  @HttpCode(200)
  findAll(@Query() query: { keywords?: string; role?: 'Admin' | 'User' }) {
    return this.usersService.findAll(query.keywords, query.role);
  }

  // ParseIntPipe
  @Get(':id')
  @HttpCode(200)
  findOne(@Param('id') id: string) {
    this.logger.log(`User id:${id} fetched`, 'UsersService');
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(200) // Lanjut agar bisa update foto profil di sini
  update(
    @Param('id') id: string,
    @Body(ValidationPipe)
    updatedUser: Prisma.UsersUpdateInput,
  ) {
    return this.usersService.update(id, updatedUser);
  }

  @Delete(':id')
  @HttpCode(200)
  delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
