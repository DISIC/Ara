import { IsEmail, IsString } from 'class-validator';

export class CancelEmailUpdateDto {
  @IsString()
  @IsEmail()
  email: string;
}
