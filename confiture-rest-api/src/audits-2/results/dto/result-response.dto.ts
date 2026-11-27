import { Expose, Type } from "class-transformer";
import { CriterionResultStatus } from "../../../generated/prisma/enums";

export class ResultResponseDto {
  @Expose()
  status: CriterionResultStatus;

  @Expose()
  compliantComment: string | null;

  @Expose()
  @Type(() => ExampleImageFileDto)
  exampleImages: ExampleImageFileDto[];

  @Expose()
  notApplicableComment: string | null;

  @Expose()
  topic: number;

  @Expose()
  criterium: number;

  @Expose()
  pageId: number;
}

class ExampleImageFileDto {
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
  thumbnailKey: string;
}
