import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class UploadChatImagesDto {
  @IsString()
  room: string;

  //   @IsString()
  //   middle_name: string;

  //   @IsString()
  //   last_name: string;

  //   @IsString()
  //   @IsNotEmpty()
  //   username: string;

  //   @IsString()
  //   @IsNotEmpty()
  //   email: string;

  //   @IsString()
  //   @IsNotEmpty()
  //   phone: string;

  //   @IsEmail()
  //   @IsNotEmpty()
  //   password: string;

  //   @IsEnum(['Admin', 'Intern'], {
  //     message: 'Invalid input!',
  //   })
  //   @IsNotEmpty()
  //   role: 'Admin' | 'Intern';

  //   @IsString()
  //   about: string;
}
