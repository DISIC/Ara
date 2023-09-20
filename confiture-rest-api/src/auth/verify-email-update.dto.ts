import { IsString } from 'class-validator';

export class VerifyEmailUpdateDto {
  @IsString()
  token: string;
}
