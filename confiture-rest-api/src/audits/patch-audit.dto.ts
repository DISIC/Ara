import { IsOptional, IsString } from "class-validator";

export class PatchAuditDto {
  @IsString()
  @IsOptional()
  notes?: string;
}
