import {
  CriterionResultStatus,
  CriterionResultUserImpact,
} from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

class UpdateResultsItem {
  // ID

  @IsString()
  pageUrl: string;

  @IsInt()
  @IsPositive()
  topic: number;

  @IsInt()
  @IsPositive()
  criterium: number;

  // DATA

  @IsString()
  @IsIn(Object.values(CriterionResultStatus))
  status: CriterionResultStatus;

  @IsString()
  @IsOptional()
  compliantComment?: string;

  @IsString()
  @IsOptional()
  errorDescription?: string;

  @IsString()
  @IsIn(Object.values(CriterionResultUserImpact))
  @IsOptional()
  userImpact?: CriterionResultUserImpact;

  @IsString()
  @IsOptional()
  recommandation?: string;

  @IsString()
  @IsOptional()
  notApplicableComment?: string;
}

export class UpdateResultsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateResultsItem)
  data: UpdateResultsItem[];
}
