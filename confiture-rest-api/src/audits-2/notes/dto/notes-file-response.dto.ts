import { Expose } from "class-transformer";

export class NotesFileResponseDto {
  @Expose()
  id: number;

  @Expose()
  originalFilename: string;

  @Expose()
  mimetype: string;

  @Expose()
  size: number;

  @Expose()
  key: string;

  @Expose()
  thumbnailKey: string | null;
}
