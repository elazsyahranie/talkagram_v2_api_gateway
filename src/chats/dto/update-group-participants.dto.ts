import {
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

// export class UpdateGroupParticipants {
//   @IsArray()
//   @ValidateNested({ each: true })
//   @Type(() => ParticipantDto)
//   participants: ParticipantDto[];
// }

// export class ParticipantDto {
//   @IsString()
//   user_id: string;

//   @IsEnum(['Admin', 'User'], {
//     message: 'Invalid input!',
//   })
//   @IsNotEmpty()
//   role: string;
// }

export class UpdateGroupParticipants {
  @IsString()
  user_id: string;

  @IsEnum(['Admin', 'User'], {
    message: 'Invalid input!',
  })
  @IsNotEmpty()
  role: string;
}
