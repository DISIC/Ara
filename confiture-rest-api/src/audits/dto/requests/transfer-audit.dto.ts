import { IsEmail } from "class-validator";

export class TransferAuditDto {
  /**
   * @example "name@domaine.com"
   */
  @IsEmail()
  newEmail: string;
}
