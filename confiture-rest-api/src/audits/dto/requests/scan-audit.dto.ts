import { IsUrl } from "class-validator";

export class ScanAuditDto {
  /**
   * @example "https://www.google.fr"
   */
  @IsUrl()
  url: string;
}
