import { IsEmail } from "class-validator";

export class TransferAuditRequestDto {
  @IsEmail()
  newEmail: string;
}
