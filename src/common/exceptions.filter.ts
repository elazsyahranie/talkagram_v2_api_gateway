import {
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
  Inject,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request, Response } from 'express';
import { MyLoggerService } from '../my-logger/my-logger.service';
// import { LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import type { LoggerService } from '@nestjs/common';
import { Logger } from 'winston';

import { PrismaClientValidationError } from '@prisma/client/runtime/library';
import { ZodError } from 'zod';

type MyResponseObj = {
  statusCode: number;
  timestamp: string;
  path: string;
  response: string | object;
};

@Catch()
export class ExceptionsFilter extends BaseExceptionFilter {
  // private readonly logger = new MyLoggerService(ExceptionsFilter.name);
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: Logger;

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const myResponseObj: MyResponseObj = {
      statusCode: 500,
      timestamp: new Date().toISOString(),
      path: request.url,
      response: '',
    };

    // Add more Prisma Error Types if you want
    if (exception instanceof HttpException) {
      const getStatusCode = exception.getStatus();
      const getResponse = exception.getResponse() as any;

      myResponseObj.statusCode = getStatusCode;
      if (typeof getResponse == 'object') {
        myResponseObj.response = getResponse.message;
      } else {
        myResponseObj.response = getResponse;
      }
    } else if (exception instanceof PrismaClientValidationError) {
      myResponseObj.statusCode = 422;
      myResponseObj.response = exception.message.replaceAll(/\n/g, ' ');
    } else if (exception instanceof ZodError) {
      myResponseObj.statusCode = 400;
      myResponseObj.response = exception._zod.def.map((err) => {
        return err.message;
      });
    } else {
      myResponseObj.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      myResponseObj.response = 'Internal Server Error';
    }

    response.status(myResponseObj.statusCode).json(myResponseObj);

    this.logger.error(
      typeof myResponseObj.response === 'string'
        ? myResponseObj.response
        : JSON.stringify(myResponseObj.response),
      undefined,
      ExceptionsFilter.name,
    );
  }
}
