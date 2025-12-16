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
  UploadedFiles,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Prisma } from '@prisma/client';
import { LoginUserDto } from './dto/login-user.dto';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import {
  AnyFilesInterceptor,
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
// import { diskStorage } from 'multer';
// import { extname } from 'path';
import { fileFilter, multerImageConfig } from 'src/file-upload.util';
import { UpdateUserDto } from './dto/update-user.dto';

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
  @UseInterceptors(
    FileInterceptor('profile', multerImageConfig('images', 'image')),
    FileInterceptor('header', multerImageConfig('images', 'image')),
  )
  create(
    @Body() userData: Prisma.UsersCreateInput,
    @UploadedFile() profile: Express.Multer.File,
  ) {
    return this.usersService.create(userData);
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
  @HttpCode(200)
  // @UseInterceptors(
  //   AnyFilesInterceptor(),
  //   FileInterceptor('profile', multerImageConfig('images', 'image')),
  //   FileInterceptor('header', multerImageConfig('images', 'image')),
  // )
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
    @Param('id') id: string,
    // updatedUser: UpdateUserDto,
    @Body(new ValidationPipe({ whitelist: true }))
    updatedUser: Prisma.UsersUpdateInput,
    @UploadedFiles()
    files: {
      profile?: Express.Multer.File[];
      header?: Express.Multer.File[];
    },
  ) {
    return this.usersService.update(
      id,
      updatedUser,
      files.profile ? files.profile[0] : undefined,
      files.header ? files.header[0] : undefined,
    );
  }

  @Delete(':id')
  @HttpCode(200)
  delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
