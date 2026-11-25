import { IsIn, IsOptional, IsString } from "class-validator";
import { CriterionResultStatus } from "../../../generated/prisma/enums";
import { IsUndefinable } from "../../../utils";

export class UpdateResultRequestDto {
  @IsString()
  @IsIn(Object.values(CriterionResultStatus))
  @IsUndefinable()
  status?: CriterionResultStatus;

  @IsString()
  @IsOptional()
  compliantComment?: string | null;

  @IsString()
  @IsOptional()
  notApplicableComment?: string | null;
}
