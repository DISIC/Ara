import { Expose } from "class-transformer";
import { NotesFileResponseDto } from "./notes-file-response.dto";

export class NotesResponseDto {
  @Expose()
  notes: string | null;
}

export class NotesWithFilesResponseDto extends NotesResponseDto {
  @Expose()
  notesFiles: NotesFileResponseDto[];
}
