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
}
