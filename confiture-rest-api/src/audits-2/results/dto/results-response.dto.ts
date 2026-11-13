import { Expose } from "class-transformer";
import { CriterionResultStatus } from "../../../generated/prisma/enums";

export class ResultsResponseDto {
  @Expose()
  data: ResultDto[];
}

class ResultDto {
  status: CriterionResultStatus;
  compliantComment: string | null;
  exampleImages: ExampleImageFileDto[];
  notApplicableComment: string | null;
  topic: number;
  criterium: number;
  pageId: number;
}

class ExampleImageFileDto {
  id: number;
  originalFilename: string;
  mimetype: string;
  size: number;
  key: string;
  thumbnailKey: string;
}
