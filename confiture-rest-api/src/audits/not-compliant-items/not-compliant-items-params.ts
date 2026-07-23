import { IsNumberString, IsString } from "class-validator";

export class NotCompliantItemsParams {
  @IsString()
  uniqueId: string;

  @IsString()
  slug: string;

  // TODO: validate topic.criterion is a valid combination

  @IsNumberString()
  topic: string;

  @IsNumberString()
  criterion: string;
}
