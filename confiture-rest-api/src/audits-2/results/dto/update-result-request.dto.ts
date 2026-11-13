import { IsIn, IsNumber, IsOptional, IsString } from "class-validator";
import { CriterionResultStatus } from "../../../generated/prisma/enums";

export class UpdateResultRequestDto {
  @IsNumber()
  pageId: number;

  @IsString()
  @IsIn(Object.values(CriterionResultStatus))
  status: CriterionResultStatus;

  @IsString()
  @IsOptional()
  compliantComment: string | null;

  @IsString()
  @IsOptional()
  notApplicableComment: string | null;
}
