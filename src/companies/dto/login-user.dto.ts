import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  //   @IsEnum(['Admin', 'User'], {
  //     message: 'Valid role required!',
  //   })
  //   role: 'Admin' | 'Intern';
}
