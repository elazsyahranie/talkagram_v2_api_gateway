import {
  Injectable,
  Inject,
  NotFoundException,
  HttpException,
} from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
// import { UpdateUserDto } from './dto/update-user.dto';
// import { CreateUserDto } from './dto/create-user.dto';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { ValidationService } from '../common/validation.service';
import { UserValidation } from './users.validation';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
// import { v4 as uuidv4 } from 'uuid';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { UserImageDto } from './dto/user-image.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private validationService: ValidationService,
    private jwtService: JwtService,
    private readonly databaseService: DatabaseService,
  ) {}

  async create(requestBody: Prisma.UsersCreateInput) {
    let { first_name, middle_name, last_name } = requestBody;
    requestBody.name =
      `${first_name ? first_name : ''} ${middle_name ? middle_name : ''} ${last_name ? last_name : ''}`.trim();

    this.validationService.validate(UserValidation.REGISTER, requestBody);

    requestBody.password = await bcrypt.hash(requestBody.password, 10);

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

    const createUser = await this.databaseService.users.create({
      data: requestBody,
    });

    this.logger.log('User created!', 'UsersService');

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

    this.logger.log('User created!', 'UsersService');

    return {
      name: findUser.name,
      email: findUser.email,
      token,
    };
  }

  async findAll(keywords?: string, role?: 'Admin' | 'User') {
    const where: Prisma.UsersWhereInput = {};
    if (keywords)
      where.name = {
        contains: keywords,
        mode: 'insensitive',
      };
    if (role) {
      where.role = role;
    }

    const result = await this.databaseService.users.findMany({
      where,
      omit: { password: true, createdAt: true, updatedAt: true },
      include: {
        company: true,
      },
    });
    if (!result.length) {
      throw new NotFoundException('Not found!');
    }

    this.logger.log('Users fetched!', 'UsersService');

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

    // this.logger.log('One user fetched!', 'UsersService');

    return {
      data: data,
    };
  }

  async update(
    id: string,
    user: Prisma.UsersUpdateInput,
    profile?: Express.Multer.File,
    header?: Express.Multer.File,
  ) {
    const findUser = await this.databaseService.users.findUnique({
      where: {
        id,
      },
    });
    if (!findUser) {
      throw new HttpException('User not found!', 404);
    }

    let { first_name, middle_name, last_name } = user;
    user.name =
      `${first_name ? first_name : findUser.first_name ? findUser.first_name : ''} ${middle_name ? middle_name : findUser.middle_name ? findUser.middle_name : ''} ${last_name ? last_name : findUser.last_name ? findUser.last_name : ''}`.trim();

    // Update password only if it's sent
    if (user.password) user.password = await bcrypt.hash(user.password, 10);

    this.validationService.validate(UserValidation.UPDATE, user);

    await this.databaseService.users.update({
      where: { id },
      data: user,
    });

    if (profile) {
      const imageDataBody: UserImageDto = {
        filename: profile.filename,
        path: profile.path.replace(/\\/g, '/'),
        type: 'Profile',
        user_id: id,
      };
      await this.databaseService.$transaction([
        // 'delete' only accepts unique columns
        // Or you can use 'composite unique key' (although we don't use it here)
        this.databaseService.userImages.deleteMany({
          where: {
            user_id: id,
            type: 'Profile',
          },
        }),
        this.databaseService.userImages.create({
          data: { ...imageDataBody },
        }),
      ]);
    }
    if (header) {
      const imageDataBody: UserImageDto = {
        filename: header.filename,
        path: header.path.replace(/\\/g, '/'),
        type: 'Header',
        user_id: id,
      };

      await this.databaseService.$transaction([
        // 'delete' only accepts unique columns
        // Or you can use 'composite unique key' (although we don't use it here)
        this.databaseService.userImages.deleteMany({
          where: {
            user_id: id,
            type: 'Header',
          },
        }),
        this.databaseService.userImages.create({
          data: { ...imageDataBody },
        }),
      ]);
    }

    this.logger.log('User updated!', 'UsersService');

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

    this.logger.log('User deleted!', 'UsersService');

    return { status: 'success' };
  }
}
