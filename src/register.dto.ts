import { IsString, MinLength, IsEmail } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  @MinLength(8)
  password: string;
}
