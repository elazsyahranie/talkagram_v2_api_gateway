import {
  Injectable,
  Inject,
  HttpException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { ValidationService } from '../common/validation.service';
import { StaffValidation } from './staffs.validation';
import { v4 as uuidv4 } from 'uuid';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { AddStaffDto } from './dto/add-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
// import * as bcrypt from 'bcrypt';

@Injectable()
export class StaffsService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private validationService: ValidationService,
    private readonly databaseService: DatabaseService,
  ) {}

  async create(admin_id: string, store_id: string, requestBody: AddStaffDto[]) {
    this.validationService.validate(StaffValidation.CREATE, requestBody);

    // Make sure only the admin staff that can add new staffs
    const isAdmin = await this.databaseService.staffs.findFirst({
      where: {
        user_id: admin_id,
        store_id: store_id,
        role: 'Admin',
      },
    });
    if (!isAdmin) {
      throw new UnauthorizedException('Unauthorized');
    }

    // const [findStore, findDuplicate] = await Promise.all([
    //   this.databaseService.staffs.findFirst({
    //     // Make sure only the admin staff that can add new staffs
    //     where: {
    //       user_id: adminId,
    //       store_id: requestBody.store,
    //       role: 'Admin',
    //     },
    //   }),
    //   // Prevent the same user being added as a staff more than once
    //   this.databaseService.staffs.findFirst({
    //     where: {
    //       user_id: requestBody.user,
    //       store_id: requestBody.store,
    //     },
    //   }),
    // ]);
    // if (!findStore) throw new NotFoundException('Not found!');
    // if (findDuplicate)
    //   throw new HttpException('User already added as staff!', 409);

    // await this.databaseService.staffs.create({
    //   data: {
    //     id: uuidv4(),
    //     user_id: requestBody.user,
    //     store_id: requestBody.store,
    //     role: requestBody.role,
    //   },
    // });

    let staffsAdded = 0;
    await Promise.all(
      requestBody.map(async (obj) => {
        const findStaff = await this.databaseService.staffs.findFirst({
          where: { user_id: obj.user, store_id },
        });

        // Prevent a user to be added as a staff if they're already did
        if (!findStaff) {
          await this.databaseService.staffs.create({
            data: {
              id: uuidv4(),
              user_id: obj.user,
              store_id,
              role: obj.role,
            },
          });
          staffsAdded++;
        }
      }),
    );

    this.logger.log(`${staffsAdded} staffs added!`, 'StaffsService');

    return { status: 'success' };
  }

  async findAllByStoreId(
    store_id: string,
    user_id: string,
    page: number,
    limit: number,
    order: string,
    keywords?: string,
    role?: 'Admin' | 'User',
  ) {
    /* 
      Make sure that every staffs can only fetch the list of staffs
      that are assigned to the stores they are assigned to. For example, 
      if you're not assigned to store A, there's no way you can fetch the
      list of staffs that are assigned to that store
    */
    const isStaff = await this.databaseService.staffs.findFirst({
      where: {
        user_id,
        store_id,
      },
    });
    if (!isStaff) {
      throw new UnauthorizedException('Unauthorized');
    }

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

    this.logger.log(
      `Stores fetched by store id: ${store_id}!`,
      'StoresService',
    );

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

  async updateStaffRole(
    admin_id: string,
    store_id: string,
    requestBody: UpdateStaffDto[],
  ) {
    // Make sure only the admin staff that can add new staffs
    const isAdmin = await this.databaseService.staffs.findFirst({
      where: {
        user_id: admin_id,
        store_id: store_id,
        role: 'Admin',
      },
    });
    if (!isAdmin) {
      throw new UnauthorizedException('Unauthorized');
    }

    this.validationService.validate(StaffValidation.UPDATE, requestBody);

    /* Make sure that every stores have at least one admin */
    // 1) Find admins on the store
    const findAdmins = await this.databaseService.staffs.findMany({
      where: { store_id, role: 'Admin' },
    });

    // 2) If here's only one admin left
    if (findAdmins.length === 1) {
      // We'll check whether we're going to make them as a non-admin in our request
      const findAdminsOnRequest = requestBody.find((obj: UpdateStaffDto) => {
        return obj.user === findAdmins[0].user_id;
      });

      // 3) If we do, then prevent next logic from executing
      if (findAdminsOnRequest && findAdminsOnRequest.role !== 'Admin') {
        throw new HttpException(
          'At least one admin is required for a store!',
          409,
        );
      }
    }

    await Promise.all(
      requestBody.map(async (obj) => {
        const findStaff = await this.databaseService.staffs.findFirst({
          where: { user_id: obj.user, store_id: store_id },
        });

        if (findStaff)
          await this.databaseService.staffs.updateMany({
            where: { user_id: obj.user, store_id: store_id },
            data: { role: obj.role },
          });
      }),
    );

    return { status: 'success' };
  }

  async deleteStaff(admin_id: string, store_id: string, user_ids: string) {
    const users = user_ids.split(',');

    // Make sure only the admin staff that can add new staffs
    const isAdmin = await this.databaseService.staffs.findFirst({
      where: {
        user_id: admin_id,
        store_id: store_id,
        role: 'Admin',
      },
    });
    if (!isAdmin) {
      throw new UnauthorizedException('Unauthorized');
    }

    /* Make sure that every stores have at least one admin */
    // 1) Find admins on the store
    const findAdmins = await this.databaseService.staffs.findMany({
      where: { store_id, role: 'Admin' },
    });

    // 2) If here's only one admin left
    if (findAdmins.length === 1) {
      // We'll check whether we're going to make them as a non-admin in our request
      const findAdminsOnRequest = users.find((id: string) => {
        return id === findAdmins[0].user_id;
      });

      // 3) If we do, then prevent next logic from executing
      if (findAdminsOnRequest) {
        throw new HttpException(
          'At least one admin is required for a store!',
          409,
        );
      }
    }

    let numberOfStaffsDeleted = 0;
    await Promise.all(
      users.map(async (user_id) => {
        const findStaff = await this.databaseService.staffs.findFirst({
          where: { user_id, store_id },
        });

        if (findStaff) {
          await this.databaseService.staffs.deleteMany({
            where: { user_id, store_id },
          });
          numberOfStaffsDeleted++;
        }
      }),
    );

    this.logger.log(`${numberOfStaffsDeleted} staffs deleted`, 'StaffsService');

    return { status: 'success' };
  }
}
