import { IsNumberString, IsString } from "class-validator";
import { IsRgaaCriterium } from "../is-rgaa-criterium.decorator";

export class ResultsParams {
  @IsString()
  uniqueId: string;

  @IsString()
  slug: string;

  @IsNumberString()
  topic: string;

  @IsNumberString()
  @IsRgaaCriterium({
    message: "topic and criterium numbers must be a valid RGAA criterium combination"
  })
  criterium: string;
}
