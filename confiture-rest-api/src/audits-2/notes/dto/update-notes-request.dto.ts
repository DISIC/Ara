import { IsJSON } from "class-validator";

export class UpdateNotesRequestDto {
  @IsJSON()
  notes: string;
}
