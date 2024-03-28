import { Type } from "class-transformer";
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  Max,
  Min
} from "class-validator";
import { IsRgaaCriterium } from "./update-results.dto";

/*
The `@Type(() => Number)` decorator is required to correctly parse strings into numbers
*/

export class UploadImageDto {
  /**
   * @example 123
   * Leave empty to upload an example for a transverse criterium
   */
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  pageId: number | undefined;

  /**
   * @example 3
   */
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(13)
  topic: number;

  /**
   * @example 2
   */
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsRgaaCriterium({
    message:
      "topic and criterium numbers must be a valid RGAA criterium combination"
  })
  criterium: number;
}
