import {
  Controller,
  Inject,
  Post,
  Get,
  Patch,
  Delete,
  HttpCode,
  Body,
  Param,
  HttpException,
  ValidationPipe,
  HttpStatus,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  UseInterceptors,
} from '@nestjs/common';
import {
  // AnyFilesInterceptor,
  FileFieldsInterceptor,
  // FileInterceptor,
} from '@nestjs/platform-express';
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
import { CreateGroupDto } from './dto/create-group.dto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError, throwError, take } from 'rxjs';
import { CurrentUser } from 'src/decorators/currentUser.decorator';
import { GetRoomsResult } from './dto/get-rooms-result.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AddGroupParticipants } from './dto/add-group-participants.dto';
import { UpdateGroupParticipants } from './dto/update-group-participants.dto';
import { SelfUpdateGroupParticipants } from './dto/self-update-group-participant.dto';

@Controller('chats')
export class ChatsController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly httpService: HttpService,
    @Inject('CHATS_SERVICE') private readonly chatsClient: ClientProxy,
    @Inject('MEDIA_SERVICE') private readonly mediaClient: ClientProxy,
  ) {}

  @Post('/rooms/participants/:id')
  @HttpCode(200)
  async addGroupParticipant(
    @Param('id') id: string,
    @CurrentUser()
    user: {
      id: string;
      // email: string
    },
    @Body() requestBody: AddGroupParticipants[],
  ) {
    const admin_id = user.id;

    const result = await firstValueFrom(
      this.chatsClient
        .send(
          { cmd: 'chatsAddGroupParticipants' },
          {
            room_id: id,
            admin: admin_id,
            participants: requestBody,
          },
        )
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

    return result;
  }

  @Post('/group')
  @HttpCode(200)
  // @Public()
  async createGroup(
    @CurrentUser()
    user: {
      id: string;
      // email: string
    },
    @Body() request: CreateGroupDto,
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

  @Get('/rooms/user')
  @HttpCode(200)
  // @Public()
  async getRooms(
    @CurrentUser()
    user: {
      id: string;
      // email: string
    },
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('order', new DefaultValuePipe('latest')) order: string,
  ) {
    const { id } = user;
    const result: GetRoomsResult = await firstValueFrom(
      this.chatsClient
        .send({ cmd: 'chatsGetRoomsByUser' }, { user: id, order, page, limit })
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

  @Patch('/rooms/self/participants/:id')
  @HttpCode(200)
  async selfUpdateParticipant(
    @Param('id') id: string,
    @CurrentUser()
    user: {
      id: string;
    },
    @Body() selfUpdatedParticipant: SelfUpdateGroupParticipants,
  ) {
    const user_id = user.id;

    const result = await firstValueFrom(
      this.chatsClient
        .send(
          { cmd: 'chatsSelfUpdateGroupParticipant' },
          { room_id: id, user: user_id, role: selfUpdatedParticipant.role },
        )
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

    return result;
  }

  @Patch('/rooms/participants/:id')
  @HttpCode(200)
  async updateGroupParticipants(
    @Param('id') id: string,
    @CurrentUser()
    user: {
      id: string;
    },
    @Body() updatedParticipants: UpdateGroupParticipants[],
  ) {
    const admin_id = user.id;

    const result = await firstValueFrom(
      this.chatsClient
        .send(
          { cmd: 'chatsUpdateGroupParticipants' },
          { room_id: id, admin: admin_id, participants: updatedParticipants },
        )
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

    return result;
  }

  @Patch('/rooms/:id')
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
  async updateGroup(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true })) updatedGroup: UpdateGroupDto,
    @CurrentUser()
    user: {
      id: string;
    },
  ) {
    const admin_id = user.id;
    // const admin_id = '1c7e5dd7-5618-4ff8-82cf-73ca0c3d237a';

    const result = await firstValueFrom(
      this.chatsClient
        .send(
          { cmd: 'chatsUpdateGroup' },
          { room_id: id, admin: admin_id, ...updatedGroup },
        )
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

    return result;
  }

  @Delete('/rooms/self/participant/:id')
  @HttpCode(200)
  async selfDeleteGroupParticipant(
    @Param('id') id: string,
    @CurrentUser()
    user: {
      id: string;
    },
  ) {
    const user_id = user.id;

    return {
      status: 'success - self delete participant',
      room_id: id,
      user: user_id,
    };
  }

  @Delete('/rooms/participants/:id')
  @HttpCode(200)
  async deleteGroupParticipants(
    @Param('id') id: string,
    @Body() participants: string[],
    @CurrentUser()
    user: {
      id: string;
    },
  ) {
    const admin_id = user.id;

    const result = await firstValueFrom(
      this.chatsClient
        .send(
          { cmd: 'chatsDeleteGroupParticipants' },
          {
            room_id: id,
            admin: admin_id,
            participantsForDeletion: participants,
          },
        )
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

    return result;

    // return {
    //   status: 'succeeded - delete room participants',
    //   room_id: id,
    //   admin: admin_id,
    //   participants,
    // };
  }
}
