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

  /**
   * @example "https://example.com/contact"
   */
  @IsString()
  pageUrl: string;

  /**
   * @example 3
   */
  @IsInt()
  @Min(1)
  @Max(13)
  topic: number;

  /**
   * @example 2
   */
  @IsInt()
  @IsPositive()
  @IsRgaaCriterium({
    message:
      'topic and criterium numbers must be a valid RGAA criterium combination',
  })
  criterium: number;

  // DATA

  /**
   * @example "NOT_COMPLIANT"
   */
  @IsString()
  @IsIn(Object.values(CriterionResultStatus))
  status: CriterionResultStatus;

  /**
   * @example "Ad culpa cupidatat proident amet ullamco proident proident mollit ipsum enim consectetur consequat labore."
   */
  @IsString()
  @IsOptional()
  compliantComment?: string;

  /**
   * @example "Consectetur ad consectetur Lorem id enim sunt amet ea."
   */
  @IsString()
  @IsOptional()
  errorDescription?: string;

  /**
   * @example "MAJOR"
   */
  @IsString()
  @IsIn(Object.values(CriterionResultUserImpact))
  @IsOptional()
  userImpact?: CriterionResultUserImpact;

  /**
   * @example "Quis do mollit eu incididunt duis et cillum ullamco laborum tempor laboris deserunt."
   */
  @IsString()
  @IsOptional()
  recommandation?: string;

  /**
   * @example "Officia aliquip aute ipsum in eiusmod ea et."
   */
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
