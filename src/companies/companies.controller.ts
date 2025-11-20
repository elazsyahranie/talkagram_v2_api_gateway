import {
  Controller,
  Post,
  Body,
  HttpCode,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { Prisma } from '@prisma/client';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}
  @Post('/')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async create(@Body() data: Prisma.CompaniesCreateInput, @Req() req: any) {
    const { id } = req.user;
    const result = await this.companiesService.create(data, id);
    return {
      data: result,
    };
  }
}
