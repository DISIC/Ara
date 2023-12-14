import { IsEmail, IsString } from "class-validator";

export class UpdateEmailDto {
  @IsString()
  @IsEmail()
  newEmail: string;

  @IsString()
  password: string;
}
