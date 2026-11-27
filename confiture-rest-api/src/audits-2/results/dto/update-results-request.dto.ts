import { IsNumber } from "class-validator";
import { UpdateResultRequestDto } from "./update-result-request.dto";

export class UpdateResultsRequestDto extends UpdateResultRequestDto {
  @IsNumber()
  topic: number;

  @IsNumber()
  criterion: number;
}
