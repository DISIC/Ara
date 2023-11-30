import { IsString } from 'class-validator';

export class SigninDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}
