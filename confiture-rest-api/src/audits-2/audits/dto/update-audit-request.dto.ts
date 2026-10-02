import { IsString } from "class-validator";

export class UpdateAuditRequestDto {
  @IsString()
  procedureName?: string;
}
