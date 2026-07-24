import {
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
  IsEnum,
} from 'class-validator';
// import { Type } from 'class-transformer';

export class AddGroupParticipants {
  @IsString()
  user_id: string;

  @IsEnum(['Admin', 'User'], {
    message: 'Invalid input!',
  })
  @IsNotEmpty()
  role: string;
}
