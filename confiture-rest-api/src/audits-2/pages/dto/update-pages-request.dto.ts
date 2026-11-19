import { Type } from "class-transformer";
import { IsArray, IsNumber, IsString, ValidateNested } from "class-validator";
import { IsUndefinable } from "../../../utils";

class UpdatedPage {
  @IsNumber()
  @IsUndefinable()
  id?: number;

  @IsString()
  name: string;

  @IsString()
  url: string;
}

export class UpdatePagesRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatedPage)
  pages: UpdatedPage[];
}
