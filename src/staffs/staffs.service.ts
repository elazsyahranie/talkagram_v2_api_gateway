import { Injectable, Inject } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { ValidationService } from '../common/validation.service';
import { StaffValidation } from './staffs.validation';
import { v4 as uuidv4 } from 'uuid';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StaffsService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private validationService: ValidationService,
    private readonly databaseService: DatabaseService,
  ) {}

  async create(requestBody: Prisma.StaffsCreateInput) {
    this.validationService.validate(StaffValidation.REGISTER, requestBody);

    const user_id = uuidv4();
    requestBody.id = user_id;
    // requestBody.password = await bcrypt.hash(requestBody.password, 10);

    // const [emailDuplicate, usernameDuplicate, phoneDuplicate] =
    //   await Promise.all([
    //     this.databaseService.staffs.count({
    //       where: {
    //         email: requestBody.email,
    //       },
    //     }),
    //     this.databaseService.staffs.count({
    //       where: {
    //         username: requestBody.username,
    //       },
    //     }),
    //     this.databaseService.staffs.count({
    //       where: {
    //         phone: requestBody.phone,
    //       },
    //     }),
    //   ]);

    // if (emailDuplicate != 0)
    //   throw new HttpException('Email already used!', 409);
    // if (usernameDuplicate != 0)
    //   throw new HttpException('Username already used!', 409);
    // if (phoneDuplicate != 0)
    //   throw new HttpException('Phone already used!', 409);

    await this.databaseService.staffs.create({
      data: requestBody,
    });

    this.logger.log('User created!', 'UsersService');

    return 'success';
  }
}
