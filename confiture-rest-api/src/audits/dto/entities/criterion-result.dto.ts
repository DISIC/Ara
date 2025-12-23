import { ExampleImageFileDto } from "./example-image-file.dto";

export class CriterionResultDto {
  id: number;
  status: Record<string, never>;
  compliantComment: string | null;
  notCompliantComment: string | null;
  userImpact: Record<string, unknown> | null;
  exampleImages: ExampleImageFileDto[];
  quickWin: boolean;
  notApplicableComment: string | null;
  topic: number;
  criterium: number;
  pageId: number;
}
