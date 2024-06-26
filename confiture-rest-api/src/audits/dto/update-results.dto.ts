import {
  CriterionResultStatus,
  CriterionResultUserImpact
} from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
  registerDecorator,
  ValidateNested,
  ValidationArguments,
  ValidationOptions
} from "class-validator";

import { CRITERIA } from "../criteria";

/** Validates the criterium property to make sure the criterium exists in the RGAA. */
export function IsRgaaCriterium(validationOptions?: ValidationOptions) {
  return function (
    object: Pick<UpdateResultsItem, "topic" | "criterium">,
    propertyName: string
  ) {
    registerDecorator({
      name: "isRgaaCriterium",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const { topic } = args.object as UpdateResultsItem;
          return !!CRITERIA.find(
            (criterium) =>
              criterium.criterium === value && criterium.topic === topic
          );
        }
      }
    });
  };
}

class UpdateResultsItem {
  // ID

  /**
   * @example 123
   */
  @IsNumber()
  pageId: number;

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
      "topic and criterium numbers must be a valid RGAA criterium combination"
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
   * Whether the status is the same on all pages
   */
  @IsBoolean()
  @IsOptional()
  transverse?: boolean;

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
  notCompliantComment?: string;

  /**
   * @example "MAJOR"
   */
  @IsString()
  @IsIn(Object.values(CriterionResultUserImpact))
  @IsOptional()
  userImpact?: CriterionResultUserImpact;

  /**
   * Whether the result is easy to fix
   */
  @IsBoolean()
  @IsOptional()
  quickWin?: boolean;

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
