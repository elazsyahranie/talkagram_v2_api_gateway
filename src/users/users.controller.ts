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
  ParseIntPipe,
  DefaultValuePipe,
  UploadedFiles,
  // UploadedFile,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
// import { UsersService } from './users.service';
// import { Prisma } from '@prisma/client';
import { LoginUserDto } from './dto/login-user.dto';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import {
  // AnyFilesInterceptor,
  FileFieldsInterceptor,
  // FileInterceptor,
} from '@nestjs/platform-express';
// import { diskStorage } from 'multer';
// import { extname } from 'path';
import { multerImageConfig } from 'src/file-upload.util';
import { Public } from 'src/decorators/public.decorator';
import { IsSuperAdminGuard } from 'src/auth/issuperadmin.guard';
// import { UpdateUserDto } from './dto/update-user.dto';
import { ClientProxy } from '@nestjs/microservices';
import {
  firstValueFrom,
  timeout,
  catchError,
  // throwError
} from 'rxjs';
import {
  MEDIA_SERVICE_HTTP_URL,
  USERS_SERVICE_UNAVAILABE_OR_CRASHED,
} from 'src/common/constants';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import axios from 'axios';
import FormData from 'form-data';
import * as dotenv from 'dotenv';
dotenv.config();
// import http from 'http';
@Controller('users')
export class UsersController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    // private readonly usersService: UsersService,
    @Inject('USERS_SERVICE') private readonly userClient: ClientProxy,
  ) {}
  // private readonly logger = new MyLoggerService(UsersController.name);

  @Post('/login')
  @HttpCode(200)
  @Public()
  async login(@Body() request: LoginUserDto) {
    try {
      // Kalau MessagePattern nya salah, masih belum ketemu pesan error yang spesifik untuk itu
      // Tapi yowes gpp itu nanti dulu
      const result = await firstValueFrom(
        this.userClient.send({ cmd: 'usersLogin' }, request).pipe(
          timeout(5000),
          catchError((error) => {
            console.dir(error.message, { depth: null });
            throw new HttpException(
              error.message || USERS_SERVICE_UNAVAILABE_OR_CRASHED,
              error.code || HttpStatus.SERVICE_UNAVAILABLE,
            );
          }),
        ),
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        USERS_SERVICE_UNAVAILABE_OR_CRASHED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @HttpCode(201)
  // @UseInterceptors(
  //   FileInterceptor('file', multerImageConfig('images', 'image')),
  //   FileInterceptor('header', multerImageConfig('images', 'image')),
  // )
  @Public()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'profile', maxCount: 1 },
        { name: 'header', maxCount: 1 },
      ],
      // multerImageConfig('images', 'image'),
    ),
  )
  async create(
    @Body() userData: CreateUserDto,
    // @UploadedFile() profile: Express.Multer.File,
    @UploadedFiles()
    files: {
      profile?: Express.Multer.File[];
      header?: Express.Multer.File[];
    },
  ) {
    // try {
    const result = await firstValueFrom(
      this.userClient.send({ cmd: 'usersRegister' }, userData).pipe(
        timeout(5000),
        catchError((error) => {
          throw new HttpException(
            error.message || USERS_SERVICE_UNAVAILABE_OR_CRASHED,
            error.code || HttpStatus.SERVICE_UNAVAILABLE,
          );
        }),
      ),
    );
    // } catch (error) {
    //   if (error instanceof HttpException) {
    //     throw error;
    //   }
    //   throw new HttpException(
    //     USERS_SERVICE_UNAVAILABE_OR_CRASHED,
    //     HttpStatus.INTERNAL_SERVER_ERROR,
    //   );
    // }

    if (files) {
      const formData = new FormData();
      // formData.append('user_id', result.user_id);

      if (files.profile)
        formData.append(
          'profile',
          files.profile[0].buffer,
          files.profile[0].originalname,
        );
      if (files.header)
        formData.append(
          'header',
          files.header[0].buffer,
          files.header[0].originalname,
        );

      // console.log('-Result user id-');
      // console.dir(result.user_id);

      await axios
        .post(
          `${MEDIA_SERVICE_HTTP_URL}/user-images/${result.user_id}`,
          formData,
          {
            headers: formData.getHeaders(),
          },
        )
        .catch((error) => {
          throw new HttpException(
            error.message || USERS_SERVICE_UNAVAILABE_OR_CRASHED,
            error.code || HttpStatus.SERVICE_UNAVAILABLE,
          );
        });
    }

    return { name: result.name, email: result.email };
  }

  @Get('/profile')
  @HttpCode(200)
  async getProfile(@Req() req: any) {
    const { id } = req.user;
    this.logger.log(`Profile ${id} fetched`, 'UsersService');
    try {
      const result = await firstValueFrom(
        this.userClient.send({ cmd: 'usersGetProfile' }, id).pipe(
          timeout(5000),
          catchError((error) => {
            // console.dir(error.message, { depth: null });
            throw new HttpException(
              error.message || USERS_SERVICE_UNAVAILABE_OR_CRASHED,
              error.code || HttpStatus.SERVICE_UNAVAILABLE,
            );
          }),
        ),
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        USERS_SERVICE_UNAVAILABE_OR_CRASHED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    // return this.usersService.findOne(id);
  }

  @Get()
  @HttpCode(200)
  async findAll(
    // @Query()
    // query: {
    //   keywords?: string;
    //   role?: 'Admin' | 'User';
    //   page?: number;
    //   limit?: number;
    // },
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('order', new DefaultValuePipe('a-z')) order: string,
    @Query('keywords') keywords?: string,
    @Query('role') role?: 'Admin' | 'User',
  ) {
    try {
      const result = await firstValueFrom(
        this.userClient
          .send({ cmd: 'usersGetAll' }, { page, limit, order, keywords, role })
          .pipe(
            timeout(5000),
            catchError((error) => {
              throw new HttpException(
                error.message || USERS_SERVICE_UNAVAILABE_OR_CRASHED,
                error.code || HttpStatus.SERVICE_UNAVAILABLE,
              );
            }),
          ),
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        USERS_SERVICE_UNAVAILABE_OR_CRASHED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    // return this.usersService.findAll(page, limit, order, keywords, role);
  }

  // ParseIntPipe
  @Get(':id')
  @HttpCode(200)
  async findOne(@Param('id') id: string) {
    try {
      const result = await firstValueFrom(
        this.userClient.send({ cmd: 'usersGetDetail' }, id).pipe(
          timeout(5000),
          catchError((error) => {
            throw new HttpException(
              error.message || USERS_SERVICE_UNAVAILABE_OR_CRASHED,
              error.code || HttpStatus.SERVICE_UNAVAILABLE,
            );
          }),
        ),
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        USERS_SERVICE_UNAVAILABE_OR_CRASHED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Sending a competely blank form-data would throw error message
  // This could be handled by either frontend (not sending the data to API if the form is completely blank)
  // Or by backend (make a condition to not process the request any further if the request being sent is blank)
  @Patch()
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
  async update(
    @Body(new ValidationPipe({ whitelist: true }))
    updatedUser: UpdateUserDto,
    @UploadedFiles()
    files: {
      profile?: Express.Multer.File[];
      header?: Express.Multer.File[];
    },
    @Req() req: any,
  ) {
    const { id } = req.user;
    // return this.usersService.update(
    //   id,
    //   updatedUser,
    //   files?.profile?.[0],
    //   files?.header?.[0],
    // );
    try {
      // console.dir(updatedUser, { depth: null });
      const result = await firstValueFrom(
        this.userClient.send({ cmd: 'usersUpdate' }, { id, updatedUser }).pipe(
          timeout(5000),
          catchError((error) => {
            throw new HttpException(
              error.message || USERS_SERVICE_UNAVAILABE_OR_CRASHED,
              error.code || HttpStatus.SERVICE_UNAVAILABLE,
            );
          }),
        ),
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        USERS_SERVICE_UNAVAILABE_OR_CRASHED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // For admins only
  @Delete('/:id')
  @HttpCode(200)
  @UseGuards(IsSuperAdminGuard)
  async deleteById(@Param('id') id: string, @Req() req: any) {
    // return this.usersService.delete(id);
    try {
      const admin_id = req.user.id;
      // console.dir(id, { depth: null });
      const result = await firstValueFrom(
        this.userClient
          .send({ cmd: 'usersDeleteForAdmin' }, { id, admin_id })
          .pipe(
            timeout(5000),
            catchError((error) => {
              throw new HttpException(
                error.message || USERS_SERVICE_UNAVAILABE_OR_CRASHED,
                error.code || HttpStatus.SERVICE_UNAVAILABLE,
              );
            }),
          ),
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        USERS_SERVICE_UNAVAILABE_OR_CRASHED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete()
  @HttpCode(200)
  async delete(@Req() req: any) {
    // return this.usersService.delete(id);
    try {
      const { id } = req.user;
      // console.dir(id, { depth: null });
      const result = await firstValueFrom(
        this.userClient.send({ cmd: 'usersDelete' }, id).pipe(
          timeout(5000),
          catchError((error) => {
            throw new HttpException(
              error.message || USERS_SERVICE_UNAVAILABE_OR_CRASHED,
              error.code || HttpStatus.SERVICE_UNAVAILABLE,
            );
          }),
        ),
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        USERS_SERVICE_UNAVAILABE_OR_CRASHED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
