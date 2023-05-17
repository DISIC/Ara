import { IsString } from 'class-validator';

export class VerifyAccountDto {
  @IsString()
  username: string;

  @IsString()
  token: string;
}
