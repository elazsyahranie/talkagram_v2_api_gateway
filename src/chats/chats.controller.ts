import {
  Controller,
  Inject,
  Post,
  HttpCode,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Public } from 'src/decorators/public.decorator';
import {
  CHATS_SERVICE_UNAVAILABLE_OR_CRASHED,
  MEDIA_SERVICE_HTTP_URL,
  MEDIA_SERVICE_UNAVAILABE_OR_CRASHED,
  USERS_SERVICE_UNAVAILABE_OR_CRASHED,
} from 'src/common/constants';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { HttpService } from '@nestjs/axios';
import { CreateGrupDto } from './dto/create-group.dto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError, throwError, take } from 'rxjs';
import { CurrentUser } from 'src/decorators/currentUser.decorator';

@Controller('chats')
export class ChatsController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly httpService: HttpService,
    @Inject('CHATS_SERVICE') private readonly chatsClient: ClientProxy,
    @Inject('MEDIA_SERVICE') private readonly mediaClient: ClientProxy,
  ) {}

  @Post('/group')
  @HttpCode(200)
  // @Public()
  async createGroup(
    @CurrentUser()
    user: {
      id: string;
      // email: string
    },
    @Body() request: CreateGrupDto,
  ) {
    const { id } = user;

    const result = await firstValueFrom(
      this.chatsClient
        .send({ cmd: 'chatsCreateGroup' }, { admin: id, ...request })
        .pipe(
          timeout(5000),
          catchError((error) => {
            throw new HttpException(
              error.message || CHATS_SERVICE_UNAVAILABLE_OR_CRASHED,
              error.code || HttpStatus.SERVICE_UNAVAILABLE,
            );
          }),
        ),
    );

    // return request;
    return result;
  }
}
