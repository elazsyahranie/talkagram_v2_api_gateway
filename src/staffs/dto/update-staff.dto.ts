import { AddStaffDto } from './add-staff.dto';
import { PartialType, OmitType } from '@nestjs/mapped-types';

export class UpdateStaffDto extends PartialType(
  OmitType(AddStaffDto, ['store']),
) {}
