import { IsJSON, IsString } from "class-validator";

export class UpdateNotesRequestDto {
  @IsString()
  @IsJSON()
  notes: string;
}
