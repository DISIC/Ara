import { IsNumber } from "class-validator";

export class DeleteNotesFileRequestDto {
  @IsNumber()
  fileId: number;
}
