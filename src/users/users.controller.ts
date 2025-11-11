import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Patch,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(
    @Body() user: { name: string; email: string; role: 'Intern' | 'Admin' },
  ) {
    return this.usersService.create(user);
  }

  @Get()
  findAll(@Query() query: { keywords?: string; role?: 'Admin' | 'Intern' }) {
    return this.usersService.findAll(query.keywords, query.role);
  }

  //   @Get('/interns')
  //   findAllInterns() {
  //     return ['Get All Interns'];
  //   }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updatedUser: { name: string; email: string; role: 'Intern' | 'Admin' },
  ) {
    return this.usersService.update(+id, updatedUser);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.usersService.delete(+id);
  }
}
