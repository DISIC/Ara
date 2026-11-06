import { Expose } from "class-transformer";
import { NotesFileDto } from "./notes-file-response.dto";

export class NotesResponseDto {
  @Expose()
  notes: string;

  @Expose()
  notesFiles: NotesFileDto[];
}
