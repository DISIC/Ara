import { IsEmail, IsString } from 'class-validator';

export class ResendVerificationEmailDto {
  @IsString()
  @IsEmail()
  username: string;
}
