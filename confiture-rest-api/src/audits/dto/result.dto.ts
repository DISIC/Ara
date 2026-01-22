import {
  CriterionResultStatus,
  CriterionResultUserImpact
} from "../../generated/prisma/client";
import { ExampleImageFileDto } from "./entities/example-image-file.dto";

export class ResultDto {
  status: CriterionResultStatus;
  compliantComment: string | null;
  notCompliantComment: string | null;
  userImpact: CriterionResultUserImpact | null;
  notApplicableComment: string | null;
  exampleImages: ExampleImageFileDto[];
  quickWin: boolean;

  topic: number;
  criterium: number;
  pageId: number;
}
