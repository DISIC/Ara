import { Expose } from "class-transformer";

export class UpdateNotesResponseDto {
  @Expose()
  notes: string; // JSON or Markdown string
}
