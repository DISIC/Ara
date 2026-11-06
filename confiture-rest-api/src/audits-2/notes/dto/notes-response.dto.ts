import { Expose } from "class-transformer";
import { NotesFileResponseDto } from "./notes-file-response.dto";

export class NotesResponseDto {
  @Expose()
  notes: string;

  @Expose()
  notesFiles: NotesFileResponseDto[];
}
