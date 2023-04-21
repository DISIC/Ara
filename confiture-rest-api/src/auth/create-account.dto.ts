import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  @IsEmail()
  username: string;

  @IsString()
  @MinLength(12)
  password: string;
}
