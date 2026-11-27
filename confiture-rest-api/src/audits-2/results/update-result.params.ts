import { IsString, Matches } from "class-validator";
import { CRITERION_REGEXP } from "./results.controller";

export class UpdateResultParams {
  @IsString()
  uniqueId: string;

  @IsString()
  slug: string;

  @Matches(CRITERION_REGEXP, { message: "Must match \"topic.criterion\" format." })
  criterion: string;
}
