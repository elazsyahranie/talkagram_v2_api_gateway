import {
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
  Inject,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request, Response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
// import { PrismaClientValidationError } from '@prisma/client/runtime/library';
// import { ZodError } from 'zod';

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

    // Use this to find out the exact error (in some cases the error message is incomplete)
    console.dir(exception, { depth: null });

    const myResponseObj: MyResponseObj = {
      statusCode: 500,
      timestamp: new Date().toISOString(),
      path: request.url,
      response: '',
    };

    /* 
      NOTES: 
      1) You can add any types of exceptions here (UnauthorizedException, HttpException, etc) 
      2) You can also use HttpException for other types of exceptions. However, it's better 
      to use each available types of exceptions provided by NestJS
      3) Each exceptions need to be handled differently
      4) In this case however, it's better to only have HttpException since this is API Gateway
    */
    if (exception instanceof HttpException) {
      const getStatusCode = exception.getStatus();
      if (getStatusCode === 3) {
        myResponseObj.statusCode = 400;
      } else if (getStatusCode === 5) {
        myResponseObj.statusCode = 404;
      } else if (getStatusCode === 10) {
        myResponseObj.statusCode = 401;
      } else if (getStatusCode === 16) {
        myResponseObj.statusCode = 401;
      } else {
        myResponseObj.statusCode = getStatusCode;
      }

      const getResponse = exception.getResponse() as any;
      // if (typeof getResponse == 'object') {
      // myResponseObj.response = getResponse.error;
      // } else {
      myResponseObj.response = getResponse;
      // }
      // console.dir(typeof getResponse, { depth: null });
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
