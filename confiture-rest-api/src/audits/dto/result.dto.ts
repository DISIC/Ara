import {
  CriterionResultStatus,
  CriterionResultUserImpact
} from "@prisma/client";
import { ExampleImageFile } from "src/generated/nestjs-dto/exampleImageFile.entity";

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
