import { Expose } from "class-transformer";
import { NotesFileResponseDto } from "./notes-file-response.dto";

export class NotesResponseDto {
  @Expose()
  notes: string | null; // JSON or Markdown string
}

export class NotesWithFilesResponseDto extends NotesResponseDto {
  @Expose()
  notesFiles: NotesFileResponseDto[];
}
