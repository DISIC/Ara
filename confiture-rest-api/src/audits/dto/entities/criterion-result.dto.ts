import { ApiProperty } from "@nestjs/swagger";
import { CriterionResultStatus } from "../../../generated/prisma/enums";
import { ExampleImageFileDto } from "./example-image-file.dto";
import { NotCompliantItemDto } from "./not-compliant-item.dto";

export class CriterionResultDto {
  @ApiProperty({ enum: CriterionResultStatus })
  status: CriterionResultStatus;
  compliantComment: string | null;
  exampleImages: ExampleImageFileDto[];
  notApplicableComment: string | null;
  topic: number;
  criterium: number;
  pageId: number;

  notCompliantItems: NotCompliantItemDto[];
}
