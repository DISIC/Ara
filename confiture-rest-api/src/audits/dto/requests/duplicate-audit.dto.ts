import { IsString } from "class-validator";

export class DuplicateAuditDto {
  /**
   * @example "My procedure"
   */
  @IsString()
  procedureName: string;
}
