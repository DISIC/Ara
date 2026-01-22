import { ExampleImageFile } from "src/generated/nestjs-dto/exampleImageFile.entity";
import {
  CriterionResultStatus,
  CriterionResultUserImpact
} from "../../generated/prisma/client";

export class ResultDto {
  status: CriterionResultStatus;
  compliantComment: string | null;
  notCompliantComment: string | null;
  userImpact: CriterionResultUserImpact | null;
  notApplicableComment: string | null;
  exampleImages: ExampleImageFile[];
  quickWin: boolean;

  topic: number;
  criterium: number;
  pageId: number;
}
