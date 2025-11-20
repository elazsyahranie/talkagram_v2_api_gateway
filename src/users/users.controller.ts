import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Patch,
  Delete,
  ParseIntPipe,
  ValidationPipe,
  HttpCode,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
// import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
// import { Users } from '@prisma/client';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
// import { RegisterUserRequest, LoginUserRequest } from 'src/models/users.model';
import { AuthGuard } from 'src/auth/auth.guard';
// import { Prisma } from 'generated/prisma/browser';
import { Prisma } from '@prisma/client';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    // private readonly authGuard: AuthGuard,
  ) {}
  private readonly logger = new MyLoggerService(UsersController.name);

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
    return this.usersService.findOne(id);
  }

  @Get(':id')
  @HttpCode(200)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Get()
  @HttpCode(200)
  findAll(@Query() query: { keywords?: string; role?: 'Admin' | 'Intern' }) {
    return this.usersService.findAll(query.keywords, query.role);
  }

  @Patch(':id')
  @HttpCode(200)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe)
    updatedUser: Prisma.UsersUpdateInput,
  ) {
    return this.usersService.update(id, updatedUser);
  }

  @Delete(':id')
  @HttpCode(200)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.delete(id);
  }
}
