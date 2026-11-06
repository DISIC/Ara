import { IsString } from "class-validator";

export class UpdateNotesRequestDto {
  @IsString()
  notes: string;
}
