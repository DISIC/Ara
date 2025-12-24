import { ApiProperty } from "@nestjs/swagger";
import { CriterionResultStatus, CriterionResultUserImpact } from "src/generated/prisma/enums";
import { ExampleImageFileDto } from "./example-image-file.dto";

export class CriterionResultDto {
  @ApiProperty({ enum: CriterionResultStatus })
  status: CriterionResultStatus;
  compliantComment: string | null;
  notCompliantComment: string | null;
  @ApiProperty({ enum: CriterionResultUserImpact })
  userImpact: CriterionResultUserImpact | null;
  exampleImages: ExampleImageFileDto[];
  quickWin: boolean;
  notApplicableComment: string | null;
  topic: number;
  criterium: number;
  pageId: number;
}
