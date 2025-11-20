import { Injectable, NotFoundException, HttpException } from '@nestjs/common';
// import { UpdateUserDto } from './dto/update-user.dto';
// import { CreateUserDto } from './dto/create-user.dto';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { ValidationService } from '../common/validation.service';
import { CompanyValidation } from './companies.validation';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
// import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CompaniesService {
  constructor(
    private validationService: ValidationService,
    // private jwtService: JwtService,
    private readonly databaseService: DatabaseService,
  ) {}
  async create(requestBody: Prisma.CompaniesCreateInput, user_id: string) {
    this.validationService.validate(CompanyValidation.CREATE, requestBody);

    const nameDuplicate = await this.databaseService.companies.count({
      where: {
        name: requestBody.name,
      },
    });

    if (nameDuplicate != 0) throw new HttpException('Name already used!', 409);

    const createCompanies = await this.databaseService.companies.create({
      data: {
        ...requestBody,
        user: { connect: { id: user_id } },
      },
    });

    return { name: createCompanies.name };
  }
}
