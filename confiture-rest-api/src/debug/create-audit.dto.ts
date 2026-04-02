import { IsString, IsIn, IsBoolean, IsEmail } from "class-validator";
import { AuditType } from "src/generated/prisma/enums";

export class CreateDebugAuditDto {
  /**
   * @example "FULL"
   */
  @IsString()
  @IsIn(Object.values(AuditType))
  auditType: AuditType;

  /**
   * @example "My procedure"
   */
  @IsString()
  procedureName: string;

  /**
   * @example "john@audit.com"
   */
  @IsEmail()
  auditorEmail: string;

  @IsBoolean()
  isComplete: boolean;

  @IsBoolean()
  isPristine: boolean;

  @IsBoolean()
  fillStatement: boolean;
}
