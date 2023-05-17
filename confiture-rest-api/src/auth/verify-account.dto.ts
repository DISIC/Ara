import { IsString } from 'class-validator';

export class VerifyAccountDto {
  @IsString()
  token: string;
}
