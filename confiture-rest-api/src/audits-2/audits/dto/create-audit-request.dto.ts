import { IsString } from "class-validator";

export class CreateAuditRequestDto {
  @IsString()
  procedureName: string;
}
