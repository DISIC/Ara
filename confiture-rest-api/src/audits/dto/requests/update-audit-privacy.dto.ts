import { IsBoolean } from "class-validator";

export class UpdateAuditPrivacyDto {
  @IsBoolean()
  isPublic: boolean;
}
