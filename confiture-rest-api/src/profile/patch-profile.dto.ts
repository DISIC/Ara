import { IsOptional, IsString } from "class-validator";

export class PatchProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  orgName?: string;
}
