import { Injectable, NotFoundException, HttpException } from '@nestjs/common';
// import { UpdateUserDto } from './dto/update-user.dto';
// import { CreateUserDto } from './dto/create-user.dto';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { ValidationService } from '../common/validation.service';
import { UserValidation } from './users.validation';
import * as bcrypt from 'bcrypt';
// import { LoginUserRequest, RegisterUserRequest } from 'src/models/users.model';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    private validationService: ValidationService,
    private jwtService: JwtService,
    private readonly databaseService: DatabaseService,
  ) {}

  async create(requestBody: Prisma.UsersCreateInput) {
    this.validationService.validate(UserValidation.REGISTER, requestBody);

    const [emailDuplicate, usernameDuplicate, phoneDuplicate] =
      await Promise.all([
        this.databaseService.users.count({
          where: {
            email: requestBody.email,
          },
        }),
        this.databaseService.users.count({
          where: {
            username: requestBody.username,
          },
        }),
        this.databaseService.users.count({
          where: {
            phone: requestBody.phone,
          },
        }),
      ]);

    if (emailDuplicate != 0)
      throw new HttpException('Email already used!', 409);
    if (usernameDuplicate != 0)
      throw new HttpException('Username already used!', 409);
    if (phoneDuplicate != 0)
      throw new HttpException('Phone already used!', 409);

    requestBody.password = await bcrypt.hash(requestBody.password, 10);

    const createUser = await this.databaseService.users.create({
      data: requestBody,
    });

    return { name: createUser.name, email: createUser.email };
  }

  async login(requestBody: LoginUserDto) {
    this.validationService.validate(UserValidation.LOGIN, requestBody);

    let findUser = await this.databaseService.users.findFirst({
      where: {
        OR: [
          {
            email: requestBody.email,
          },
          {
            phone: requestBody.phone,
          },
          {
            username: requestBody.username,
          },
        ],
      },
    });
    if (!findUser) {
      throw new HttpException('No user found!', 404);
    }

    const isPasswordValid = await bcrypt.compare(
      requestBody.password,
      findUser.password,
    );
    if (!isPasswordValid) {
      throw new HttpException('Password invalid!', 401);
    }

    const token = await this.jwtService.signAsync({
      id: findUser.id,
      name: findUser.name,
      role: findUser.role,
      email: findUser.email,
    });

    return {
      name: findUser.name,
      email: findUser.email,
      token,
    };
  }

  async findAll(keywords?: string, role?: 'Intern' | 'Admin') {
    const where: Prisma.UsersWhereInput = {};
    if (keywords)
      where.name = {
        contains: 'john',
        mode: 'insensitive', // ILIKE '%john%'
      };
    if (role) {
      where.role = role;
    }
    const result = await this.databaseService.users.findMany({
      where,
      omit: { password: true, createdAt: true, updatedAt: true },
    });
    if (!result) {
      throw new NotFoundException(404, 'User not found!');
    }

    return {
      data: result,
    };
  }

  async findOne(id: string) {
    const data = await this.databaseService.users.findUnique({
      where: { id },
      omit: { password: true, createdAt: true, updatedAt: true },
    });
    if (!data) {
      throw new NotFoundException(404, 'User not found!');
    }

    return {
      data: data,
    };
  }

  async update(id: string, user: Prisma.UsersUpdateInput) {
    const findUser = await this.databaseService.users.count({
      where: {
        id,
      },
    });
    if (findUser === 0) {
      throw new HttpException('User not found!', 404);
    }

    this.validationService.validate(UserValidation.UPDATE, user);

    await this.databaseService.users.update({
      where: { id },
      data: user,
    });

    return {
      status: 'success',
    };
  }

  async delete(id: string) {
    const findUser = await this.databaseService.users.count({
      where: {
        id,
      },
    });
    if (findUser === 0) {
      throw new HttpException('User not found!', 404);
    }

    await this.databaseService.users.delete({
      where: {
        id,
      },
    });

    return { status: 'success' };
  }
}
