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
  Max,
  Min,
  registerDecorator,
  ValidateNested,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

import { CRITERIA } from './criteria';

/** Validates the criterium property to make sure the criterium exists in the RGAA. */
function IsRgaaCriterium(validationOptions?: ValidationOptions) {
  return function (object: UpdateResultsItem, propertyName: string) {
    registerDecorator({
      name: 'isRgaaCriterium',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const { topic } = args.object as UpdateResultsItem;
          return !!CRITERIA.find(
            (criterium) =>
              criterium.criterium === value && criterium.topic === topic,
          );
        },
      },
    });
  };
}

class UpdateResultsItem {
  // ID

  @IsString()
  pageUrl: string;

  @IsInt()
  @Min(1)
  @Max(13)
  topic: number;

  @IsInt()
  @IsPositive()
  @IsRgaaCriterium({
    message:
      'topic and criterium numbers must be a valid RGAA criterium combination',
  })
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
