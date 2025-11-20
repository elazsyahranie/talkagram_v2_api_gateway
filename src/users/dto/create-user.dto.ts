import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsEnum(['Super Admin', 'Intern'], {
        message: "Valid role required!"
    })
    role: 'Admin' | 'Intern'
}