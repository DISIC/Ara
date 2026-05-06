import { IsEmail } from "class-validator";

export class TransferAuditDto {
  /**
   * @example "name@domain.com"
   */
  @IsEmail()
  senderEmail: string;

  /**
   * @example "name@domaine.com"
   */
  @IsEmail()
  newEmail: string;
}
