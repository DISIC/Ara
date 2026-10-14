import { IsString } from "class-validator";

export class DuplicateAuditRequestDto {
  @IsString()
  procedureName: string;
}
