import {
  CriterionResultStatus,
  CriterionResultUserImpact
} from "src/generated/nestjs-dto/enums";
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
