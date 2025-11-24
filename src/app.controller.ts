import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { finalResultType } from './external-api.interface';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/fetch')
  async fetchExternalApi(
    @Query() query: { results?: number; page?: number },
  ): Promise<finalResultType[]> {
    const result = await this.appService.fetchExternalApi(
      query.results,
      query.page,
    );
    return result;
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
