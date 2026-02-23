import {
  Injectable,
  Inject,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { ValidationService } from '../common/validation.service';
import { StaffValidation } from './staffs.validation';
import { v4 as uuidv4 } from 'uuid';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { AddStaffDto } from './dto/add-staff.dto';
// import * as bcrypt from 'bcrypt';

@Injectable()
export class StaffsService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private validationService: ValidationService,
    private readonly databaseService: DatabaseService,
  ) {}

  /* 
    Lanjut lagi:
    -Teruskan ke CRUD yang lain
  */
  async create(adminId: string, requestBody: AddStaffDto) {
    this.validationService.validate(StaffValidation.CREATE, requestBody);

    const [findStore, findDuplicate] = await Promise.all([
      this.databaseService.staffs.findFirst({
        // Make sure only the admin staff that can add new staffs
        where: {
          user_id: adminId,
          store_id: requestBody.store,
          role: 'Admin',
        },
      }),
      // Prevent the same user being added as a staff more than once
      this.databaseService.staffs.findFirst({
        where: {
          user_id: requestBody.user,
          store_id: requestBody.store,
        },
      }),
    ]);
    if (!findStore) throw new NotFoundException('Not found!');
    if (findDuplicate)
      throw new HttpException('User already added as staff!', 409);

    await this.databaseService.staffs.create({
      data: {
        id: uuidv4(),
        user_id: requestBody.user,
        store_id: requestBody.store,
        role: requestBody.role,
      },
    });

    this.logger.log('Staff created!', 'StaffsService');

    return { status: 'success', data: requestBody };
  }

  async findAllByStoreId(
    store_id: string,
    page: number,
    limit: number,
    order: string,
    keywords?: string,
    role?: 'Admin' | 'User',
  ) {
    const where: Prisma.StaffsWhereInput = {};
    where.store_id = store_id;
    if (keywords)
      where.user = {
        name: {
          contains: keywords,
          mode: 'insensitive',
        },
      };
    if (role) {
      where.role = role;
    }

    const totalData = await this.databaseService.staffs.count({ where });

    const totalPage = Math.ceil(totalData / limit);
    const offset = page * limit - limit;

    const orderBy: Prisma.StaffsOrderByWithRelationInput[] = [];

    if (order === 'a-z') {
      orderBy.push({ user: { name: 'asc' } }, { id: 'asc' });
    } else if (order === 'z-a') {
      orderBy.push({ user: { name: 'desc' } }, { id: 'desc' });
    } else if (order === 'latest') {
      orderBy.push({ user: { createdAt: 'desc' } }, { id: 'asc' });
    } else if (order === 'oldest') {
      orderBy.push({ user: { createdAt: 'asc' } }, { id: 'desc' });
    }

    const result = await this.databaseService.staffs.findMany({
      where,
      select: {
        id: true,
        store_id: true,
        user_id: true,
        role: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            first_name: true,
            middle_name: true,
            last_name: true,
            name: true,
            username: true,
            email: true,
            phone: true,
            user_images: {
              select: {
                id: true,
                path: true,
                type: true,
              },
            },
          },
        },
      },
      skip: offset,
      take: limit,
      orderBy,
    });
    if (!result.length) {
      throw new NotFoundException('Not found!');
    }

    const finalResult = result.map((obj) => {
      const userImages = obj.user.user_images.length
        ? obj.user.user_images.map((obj) => {
            return { ...obj, path: `${process.env.PROJECT_URL}/${obj.path}` };
          })
        : [];

      return {
        ...obj,
        user: { ...obj.user, user_images: userImages },
      };
    });

    this.logger.log('Stores fetched!', 'StoresService');

    return {
      totalData,
      totalPage,
      page,
      data: finalResult,
    };
  }

  async findAll(
    page: number,
    limit: number,
    order: string,
    keywords?: string,
    role?: 'Admin' | 'User',
    // store_id?: string,
  ) {
    const where: Prisma.StaffsWhereInput = {};
    if (keywords)
      where.OR = [
        {
          user: {
            name: {
              contains: keywords,
              mode: 'insensitive',
            },
          },
        },
        {
          stores: {
            name: {
              contains: keywords,
              mode: 'insensitive',
            },
          },
        },
      ];
    if (role) {
      where.role = role;
    }

    const totalData = await this.databaseService.staffs.count({ where });

    const totalPage = Math.ceil(totalData / limit);
    const offset = page * limit - limit;

    const orderBy: Prisma.StaffsOrderByWithRelationInput[] = [];

    if (order === 'a-z') {
      orderBy.push(
        { user: { name: 'asc' } },
        { stores: { name: 'asc' } },
        { id: 'asc' },
      );
    } else if (order === 'z-a') {
      orderBy.push(
        { user: { name: 'desc' } },
        { stores: { name: 'asc' } },
        { id: 'desc' },
      );
    } else if (order === 'latest') {
      orderBy.push({ user: { createdAt: 'desc' } }, { id: 'asc' });
    } else if (order === 'oldest') {
      orderBy.push({ user: { createdAt: 'asc' } }, { id: 'desc' });
    }

    const result = await this.databaseService.staffs.findMany({
      where,
      select: {
        id: true,
        store_id: true,
        user_id: true,
        role: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            first_name: true,
            middle_name: true,
            last_name: true,
            name: true,
            username: true,
            email: true,
            phone: true,
            user_images: {
              select: {
                id: true,
                path: true,
                type: true,
              },
            },
          },
        },
        stores: {
          select: {
            id: true,
            name: true,
            address: true,
            store_images: {
              select: {
                id: true,
                path: true,
                type: true,
              },
            },
          },
        },
      },
      skip: offset,
      take: limit,
      orderBy,
    });
    if (!result.length) {
      throw new NotFoundException('Not found!');
    }

    const finalResult = result.map((obj) => {
      const userImages = obj.user.user_images.length
        ? obj.user.user_images.map((obj) => {
            return { ...obj, path: `${process.env.PROJECT_URL}/${obj.path}` };
          })
        : [];

      const storeImages = obj.stores.store_images.length
        ? obj.stores.store_images.map((obj) => {
            return { ...obj, path: `${process.env.PROJECT_URL}/${obj.path}` };
          })
        : [];

      return {
        ...obj,
        user: { ...obj.user, user_images: userImages },
        stores: { ...obj.stores, store_images: storeImages },
      };
    });

    this.logger.log('Stores fetched!', 'StoresService');

    return {
      totalData,
      totalPage,
      page,
      data: finalResult,
    };
  }
}
