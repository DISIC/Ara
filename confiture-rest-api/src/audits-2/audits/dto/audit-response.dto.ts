import { Expose } from "class-transformer";

export class AuditResponseDto {
  @Expose()
  editUniqueId: string;

  @Expose()
  procedureName: string;
}
