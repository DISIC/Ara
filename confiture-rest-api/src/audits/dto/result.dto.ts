import {
  CriterionResultStatus,
  CriterionResultUserImpact
} from "@prisma/client";
import { ExampleImageFile } from "src/generated/nestjs-dto/exampleImageFile.entity";

export class ResultDto {
  status: CriterionResultStatus;
  compliantComment: null | string;
  notCompliantComment: null | string;
  userImpact: null | CriterionResultUserImpact;
  notApplicableComment: null | string;
  exampleImages: ExampleImageFile[];
  quickWin: boolean;

  topic: number;
  criterium: number;
  pageId: number;
}
