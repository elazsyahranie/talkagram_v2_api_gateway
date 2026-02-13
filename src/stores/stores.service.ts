import {
  Injectable,
  Inject,
  NotFoundException,
  HttpException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Prisma } from '@prisma/client';
import { ValidationService } from '../common/validation.service';
import { StoreValidation } from './stores.validation';
import { DatabaseService } from 'src/database/database.service';
import { StoreImagesDto } from 'src/users/dto/store-images.dto';
import * as dotenv from 'dotenv';
// import Redis from 'ioredis';
dotenv.config();
import { deleteFileIfExists } from 'src/file-upload.util';

@Injectable()
export class StoresService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private validationService: ValidationService,
    private readonly databaseService: DatabaseService,
  ) {}

  async create(
    requestBody: Prisma.StoresCreateInput,
    user_id: string,
    profile?: Express.Multer.File,
    header?: Express.Multer.File,
  ) {
    this.validationService.validate(StoreValidation.CREATE, requestBody);

    const store_id = uuidv4();
    requestBody.id = store_id;

    const nameDuplicate = await this.databaseService.stores.count({
      where: {
        name: requestBody.name,
      },
    });

    if (nameDuplicate != 0) throw new HttpException('Name already used!', 409);

    await this.databaseService.$transaction([
      this.databaseService.stores.create({
        data: requestBody,
      }),
      this.databaseService.staffs.create({
        data: { id: uuidv4(), store_id, user_id, role: 'Admin' },
      }),
    ]);

    if (profile) {
      const imageDataBody: StoreImagesDto = {
        filename: profile.filename,
        path: profile.path.replace(/\\/g, '/'),
        type: 'Profile',
        store_id: store_id,
      };
      await this.databaseService.storeImages.create({
        data: { ...imageDataBody },
      });
    }

    if (header) {
      const imageDataBody: StoreImagesDto = {
        filename: header.filename,
        path: header.path.replace(/\\/g, '/'),
        type: 'Header',
        store_id,
      };

      await this.databaseService.storeImages.create({
        data: { ...imageDataBody },
      });
    }

    this.logger.log('Store created!', 'StoresService');

    return { status: 'success' };
  }

  async findOne(id: string) {
    const data = await this.databaseService.stores.findUnique({
      where: { id },
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
    });
    if (!data) {
      throw new NotFoundException(404, 'Store not found!');
    }

    const storeImages = data.store_images.length
      ? data.store_images.map((obj) => {
          return { ...obj, path: `${process.env.PROJECT_URL}/${obj.path}` };
        })
      : [];

    this.logger.log(`Store ${id} fetched!`, 'StoresService');

    const finalData = { ...data, store_images: storeImages };

    return finalData;
  }

  async findAll(page: number, limit: number, order: string, keywords?: string) {
    const where: Prisma.StoresWhereInput = {};
    if (keywords)
      where.name = {
        contains: keywords,
        mode: 'insensitive',
      };

    const totalData = await this.databaseService.stores.count({ where });

    const totalPage = Math.ceil(totalData / limit);
    const offset = page * limit - limit;

    const orderBy: Prisma.StoresOrderByWithRelationInput = {};
    if (order === 'a-z') {
      orderBy.name = 'asc';
    } else if (order === 'z-a') {
      orderBy.name = 'desc';
    } else if (order === 'latest') {
      orderBy.createdAt = 'desc';
    } else if (order === 'oldest') {
      orderBy.createdAt = 'asc';
    }

    const result = await this.databaseService.stores.findMany({
      where,
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
      skip: offset,
      take: limit,
      orderBy,
    });
    if (!result.length) {
      throw new NotFoundException(404, 'Not found!');
    }

    const finalResult = result.map((obj) => {
      const storeImages = obj.store_images.length
        ? obj.store_images.map((obj) => {
            return { ...obj, path: `${process.env.PROJECT_URL}/${obj.path}` };
          })
        : [];

      return { ...obj, store_images: storeImages };
    });

    this.logger.log('Stores fetched!', 'StoresService');

    return { totalData, totalPage, page, data: finalResult };
  }

  async update(
    id: string,
    user_id: string,
    store: Prisma.StoresUpdateInput,
    profile?: Express.Multer.File,
    header?: Express.Multer.File,
  ) {
    // Send response if the form-data being sent is blank
    if (!store) {
      return { status: 'success' };
    }

    // Find the store and check whether the user is the admin or not
    const findStore = await this.databaseService.staffs.findFirst({
      where: {
        store_id: id,
        user_id,
        role: 'Admin',
      },
    });
    if (!findStore) {
      throw new HttpException('Not found!', 404);
    }

    await this.databaseService.stores.update({
      where: { id },
      data: store,
    });

    if (profile) {
      const imageDataBody: StoreImagesDto = {
        filename: profile.filename,
        path: profile.path.replace(/\\/g, '/'),
        type: 'Profile',
        store_id: id,
      };
      await this.databaseService.$transaction([
        // 'delete' only accepts unique columns
        // Or you can use 'composite unique key' (although we don't use it here)
        this.databaseService.storeImages.deleteMany({
          where: {
            store_id: id,
            type: 'Profile',
          },
        }),
        this.databaseService.storeImages.create({
          data: { ...imageDataBody },
        }),
      ]);
    }
    if (header) {
      const imageDataBody: StoreImagesDto = {
        filename: header.filename,
        path: header.path.replace(/\\/g, '/'),
        type: 'Header',
        store_id: id,
      };

      await this.databaseService.$transaction([
        // 'delete' only accepts unique columns
        // Or you can use 'composite unique key' (although we don't use it here)
        this.databaseService.storeImages.deleteMany({
          where: {
            store_id: id,
            type: 'Header',
          },
        }),
        this.databaseService.storeImages.create({
          data: { ...imageDataBody },
        }),
      ]);
    }

    this.logger.log('Store updated!', 'StoreService');

    return {
      status: 'success',
    };
  }

  /* 
    LANJUTKAN DI:
    -Delete
    -Cek lagi di module users (terutama di users.service.ts) apakah ada yang harus di-fix atau dihapus
  */
  async delete(store_id: string, user_id: string) {
    // Find the store and check whether the user is the admin or not
    const findStore = await this.databaseService.staffs.findFirst({
      where: {
        store_id,
        user_id,
        role: 'Admin',
      },
      select: {
        id: true,
        stores: {
          select: {
            id: true,
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
    });
    if (!findStore) {
      throw new HttpException('Not found!', 404);
    }

    await this.databaseService.stores.delete({
      where: {
        id: store_id,
      },
    });

    if (findStore.stores.store_images.length) {
      const filePaths = findStore.stores.store_images.map((obj) => {
        return obj.path;
      });
      deleteFileIfExists(filePaths);
    }

    this.logger.log('Store deleted!', 'StoresService');

    return { status: 'success' };
  }
}
