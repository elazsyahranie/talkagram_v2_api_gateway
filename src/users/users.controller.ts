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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Prisma } from '@prisma/client';
import { LoginUserDto } from './dto/login-user.dto';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

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
  create(@Body() userData: Prisma.UsersCreateInput) {
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
