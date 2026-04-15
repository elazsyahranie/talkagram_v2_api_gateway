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
import { CurrentUser } from 'src/decorators/currentUser.decorator';
import { IsSuperAdminGuard } from 'src/auth/issuperadmin.guard';
// import { UpdateUserDto } from './dto/update-user.dto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError, throwError, take } from 'rxjs';
import {
  MEDIA_SERVICE_HTTP_URL,
  MEDIA_SERVICE_UNAVAILABE_OR_CRASHED,
  USERS_SERVICE_UNAVAILABE_OR_CRASHED,
} from 'src/common/constants';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
// import axios from 'axios';
import FormData from 'form-data';
import * as dotenv from 'dotenv';
import { HttpService } from '@nestjs/axios';
import {
  GetUserResult,
  // GetUserResult,
  GetUsersResult,
  UserData,
  UserImagesResult,
} from './dto/get-users-result.dto';
dotenv.config();
// import http from 'http';

@Controller('users')
export class UsersController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly httpService: HttpService,
    // private readonly usersService: UsersService,
    @Inject('USERS_SERVICE') private readonly userClient: ClientProxy,
    @Inject('MEDIA_SERVICE') private readonly mediaClient: ClientProxy,
  ) {}
  // private readonly logger = new MyLoggerService(UsersController.name);

  @Post('/login')
  @HttpCode(200)
  @Public()
  async login(@Body() request: LoginUserDto) {
    /* 
      NOTE: Masih belum ketemu pesan error yang cocok kalau MessagePattern nya salah, 
      atau kalau service yang dituju tidak aktif atau sedang tidak bisa diakses. Untuk 
      saat ini mungkin dibiarkan dulu saja. Paling nanti error nya secara detail di log,
      jangan di return apalagi sampai detailnya ke client/frontend. Malah riskan dari segi
      security
    */
    // try {
    const result = await firstValueFrom(
      this.userClient.send({ cmd: 'usersLogin' }, request).pipe(
        timeout(5000),
        catchError((error) => {
          // console.log('Login error');
          // console.dir(error.message, { depth: null });
          throw new HttpException(
            error.message || USERS_SERVICE_UNAVAILABE_OR_CRASHED,
            error.code || HttpStatus.SERVICE_UNAVAILABLE,
          );
        }),
      ),
    );

    return result;
    // } catch (error) {
    //   if (error instanceof HttpException) {
    //     throw error;
    //   }
    //   throw new HttpException(
    //     USERS_SERVICE_UNAVAILABE_OR_CRASHED,
    //     HttpStatus.INTERNAL_SERVER_ERROR,
    //   );
    // }
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
    const result = await firstValueFrom(
      this.userClient.send({ cmd: 'usersRegister' }, userData).pipe(
        timeout(5000),
        catchError((error) => {
          return throwError(
            () =>
              new HttpException(
                error.message || USERS_SERVICE_UNAVAILABE_OR_CRASHED,
                error.code || HttpStatus.SERVICE_UNAVAILABLE,
              ),
          );
        }),
      ),
    );

    if (Object.keys(files).length) {
      const formData = new FormData();

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

      /* 
        Masih belum dapat ditampilkan kalau error karena ECONNREFUSED. 
        Tapi kalau perlu error ECONNREFUSED atau error serupa dimasukan
        ke dalam log ketimbang di return ke frontend/client, apalagi di 
        environment production
      */
      await firstValueFrom(
        this.httpService
          .post(
            `${MEDIA_SERVICE_HTTP_URL}/user-images/${result.user_id}`,
            formData,
            {
              headers: formData.getHeaders(),
            },
          )
          .pipe(
            timeout(5000),
            catchError((error) => {
              return throwError(
                () =>
                  new HttpException(
                    error.message || MEDIA_SERVICE_UNAVAILABE_OR_CRASHED,
                    error.code || HttpStatus.SERVICE_UNAVAILABLE,
                  ),
              );
            }),
          ),
      );
    }

    return { name: result.name, email: result.email };
  }

  @Get('/profile')
  @HttpCode(200)
  async getProfile(
    @CurrentUser()
    user: {
      id: string;
      // email: string
    },
    // @Req() req: any,
  ) {
    const { id } = user;
    // const id = '0bdbac9a-8dee-4e1b-971d-3ba0bbcb30ba';

    const result: GetUserResult = await firstValueFrom(
      this.userClient.send({ cmd: 'usersGetProfile' }, id).pipe(
        timeout(5000),
        catchError((error) => {
          throw new HttpException(
            error.message || USERS_SERVICE_UNAVAILABE_OR_CRASHED,
            error.code || HttpStatus.SERVICE_UNAVAILABLE,
          );
        }),
      ),
    );

    // if (result) {
    if (result.data) {
      const userImages: UserImagesResult[] = await firstValueFrom(
        this.mediaClient
          .send({ cmd: 'userImagesGetByIds' }, { user_ids: [id] })
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

      this.logger.log(`Profile ${id} fetched`, 'UsersService');

      return { ...result, data: { ...result.data, user_images: userImages } };
    }
    // }

    return result;
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
    // try {
    const result: GetUsersResult = await firstValueFrom(
      this.userClient
        .send({ cmd: 'usersGetAll' }, { page, limit, order, keywords, role })
        .pipe(timeout(5000)),
    )
      .then((result) => {
        return result;
      })
      .catch((error) => {
        throw new HttpException(
          error.message || USERS_SERVICE_UNAVAILABE_OR_CRASHED,
          error.code || HttpStatus.SERVICE_UNAVAILABLE,
        );
      });

    /* 
      Untuk berikutnya: 
      1) Masukan api-gateway dan semua services ke satu repository Git (monorepo)
      2) Buatkan type atau DTO untuk result dari `getUsers`
    */
    // if (result) {
    if (result.data.length) {
      const user_ids = result.data.map((obj: UserData) => {
        return obj.id;
      });

      const userImages: UserImagesResult[] = await firstValueFrom(
        this.mediaClient.send({ cmd: 'userImagesGetByIds' }, { user_ids }).pipe(
          timeout(5000),
          catchError((error) => {
            throw new HttpException(
              error.message || USERS_SERVICE_UNAVAILABE_OR_CRASHED,
              error.code || HttpStatus.SERVICE_UNAVAILABLE,
            );
          }),
        ),
      );

      const finalResult = result.data.map((obj: UserData) => {
        const findImages = userImages.filter(
          (usrImg: UserImagesResult) => usrImg.user_id === obj.id,
        );

        return { ...obj, user_images: findImages };
      });

      this.logger.log(`Users fetched`, 'UsersService');

      return { ...result, data: finalResult };
    }
    // }
    // return result;

    // } catch (error) {
    //   if (error instanceof HttpException) {
    //     throw error;
    //   }
    //   throw new HttpException(
    //     USERS_SERVICE_UNAVAILABE_OR_CRASHED,
    //     HttpStatus.INTERNAL_SERVER_ERROR,
    //   );
    // }
  }

  // ParseIntPipe
  @Get(':id')
  @HttpCode(200)
  async findOne(@Param('id') id: string) {
    const result: GetUserResult = await firstValueFrom(
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

    /* 
      Untuk berikutnya: 
      1) Masukan api-gateway dan semua services ke satu repository Git (monorepo)
      2) Buatkan type atau DTO untuk result dari `getUsers`
    */
    // if (result) {
    if (result.data) {
      const userImages: UserImagesResult[] = await firstValueFrom(
        this.mediaClient
          .send({ cmd: 'userImagesGetByIds' }, { user_ids: [id] })
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

      this.logger.log(`User ${id} fetched`, 'UsersService');

      return { ...result, data: { ...result.data, user_images: userImages } };
    }
    // }
  }

  /* 
    Sending a competely blank form-data would throw error message
    This could be handled by either frontend (not sending the data to API if the form is completely blank)
    Or by backend (make a condition to not process the request any further if the request being sent is blank) 
  */
  @Patch()
  @HttpCode(200)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'profile', maxCount: 1 },
        { name: 'header', maxCount: 1 },
      ],
      // multerImageConfig('images', 'image'),
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
    @CurrentUser()
    user: {
      id: string;
    },
  ) {
    const user_id = user.id;
    // const user_id = '0bdbac9a-8dee-4e1b-971d-3ba0bbcb30ba';
    if (updatedUser) {
      await firstValueFrom(
        this.userClient
          .send({ cmd: 'usersUpdate' }, { id: user_id, updatedUser })
          .pipe(
            timeout(5000),
            // take(1),
            // timeout({ first: 5000 }),
            catchError((error) => {
              throw new HttpException(
                error.message || USERS_SERVICE_UNAVAILABE_OR_CRASHED,
                error.code || HttpStatus.SERVICE_UNAVAILABLE,
              );
            }),
          ),
      );
    }
    if (Object.keys(files).length) {
      const formData = new FormData();

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

      await firstValueFrom(
        this.httpService
          .patch(`${MEDIA_SERVICE_HTTP_URL}/user-images/${user_id}`, formData, {
            headers: formData.getHeaders(),
          })
          .pipe(
            timeout(5000),
            catchError((error) => {
              return throwError(
                () =>
                  new HttpException(
                    error.message || MEDIA_SERVICE_UNAVAILABE_OR_CRASHED,
                    error.code || HttpStatus.SERVICE_UNAVAILABLE,
                  ),
              );
            }),
          ),
      );
    }

    return { status: 'success' };
  }

  // For admins only
  @Delete('/:id')
  @HttpCode(200)
  @UseGuards(IsSuperAdminGuard)
  async deleteById(
    @Param('id') id: string,
    @CurrentUser()
    user: {
      id: string;
      // email: string
    },
    // @Req() req: any
  ) {
    // return this.usersService.delete(id);
    // try {
    const admin_id = user.id;
    await firstValueFrom(
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

    await firstValueFrom(
      this.mediaClient.send({ cmd: 'userImageDelete' }, id).pipe(
        timeout(5000),
        catchError((error) => {
          console.dir(error, { depth: null });
          return throwError(
            () =>
              new HttpException(
                error.message || USERS_SERVICE_UNAVAILABE_OR_CRASHED,
                error.code || HttpStatus.SERVICE_UNAVAILABLE,
              ),
          );
        }),
      ),
    );

    // return result;
    return { status: 'success' };
    // } catch (error) {
    //   if (error instanceof HttpException) {
    //     throw error;
    //   }
    //   throw new HttpException(
    //     USERS_SERVICE_UNAVAILABE_OR_CRASHED,
    //     HttpStatus.INTERNAL_SERVER_ERROR,
    //   );
    // }
  }

  @Delete()
  @HttpCode(200)
  async delete(
    // @Req() req: any
    @CurrentUser()
    user: {
      id: string;
      // email: string
    },
  ) {
    // return this.usersService.delete(id);
    // try {
    const { id } = user;
    // console.dir(id, { depth: null });
    // const result =
    await firstValueFrom(
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

    await firstValueFrom(
      this.mediaClient.send({ cmd: 'userImageDelete' }, id).pipe(
        timeout(5000),
        catchError((error) => {
          console.dir(error, { depth: null });
          return throwError(
            () =>
              new HttpException(
                error.message || USERS_SERVICE_UNAVAILABE_OR_CRASHED,
                error.code || HttpStatus.SERVICE_UNAVAILABLE,
              ),
          );
        }),
      ),
    );

    return { status: 'success' };
    // return result;
    // } catch (error) {
    //   if (error instanceof HttpException) {
    //     throw error;
    //   }
    //   throw new HttpException(
    //     USERS_SERVICE_UNAVAILABE_OR_CRASHED,
    //     HttpStatus.INTERNAL_SERVER_ERROR,
    //   );
    // }
  }
}
