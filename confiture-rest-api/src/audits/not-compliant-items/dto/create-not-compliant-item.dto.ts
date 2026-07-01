import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";
import { CriterionResultUserImpact } from "../../../generated/prisma/client";
export class CreateNotCompliantItemDto {
  @IsString()
  @IsOptional()
  title?: string | null;

  @IsString()
  @IsOptional()
  comment?: string | null;

  @IsEnum(Object.values(CriterionResultUserImpact))
  @IsOptional()
  userImpact?: CriterionResultUserImpact | null;

  @IsBoolean()
  @IsOptional()
  quickWin?: boolean;
}
