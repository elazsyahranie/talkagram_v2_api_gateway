import { IsEmail, IsNotEmpty, IsString, IsEnum, IsUUID } from 'class-validator';

export class AddStaffDto {
  @IsString()
  @IsNotEmpty()
  user: string;

  @IsString()
  @IsNotEmpty()
  store: string;

  @IsEnum(['Admin', 'Staff'], {
    message: 'Valid role required!',
  })
  @IsNotEmpty()
  role: string;

  //   @IsEnum(['Admin', 'User'], {
  //     message: 'Valid role required!',
  //   })
  //   role: 'Admin' | 'Intern';
}
