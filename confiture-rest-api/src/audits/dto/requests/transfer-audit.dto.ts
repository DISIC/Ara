import { IsEmail, IsOptional, IsString } from "class-validator";

export class TransferAuditDto {
  /**
   * @example "name@domain.com"
   */
  @IsEmail()
  senderEmail: string;

  /**
   * @example "John Doe"
   */
  @IsString()
  @IsOptional()
  senderName?: string;

  /**
   * @example "name@domaine.com"
   */
  @IsEmail()
  newEmail: string;
}
