import { Type } from "class-transformer";
import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";
import { CreatePageRequestDto } from "../../pages/dto/create-page-request.dto";

export class CreateAuditRequestDto {
  @IsString()
  procedureName: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePageRequestDto)
  pages?: CreatePageRequestDto[];
}
