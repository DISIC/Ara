export class NotesFileDto {
  id: number;
  originalFilename: string;
  mimetype: string;
  size: number;
  key: string;
  thumbnailKey: string | null;
}
