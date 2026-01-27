import { CriterionResultDto } from "./entities/criterion-result.dto";

export class GetPageWithResultsDto {
  id: number;
  name: string;
  results: CriterionResultDto[];
}
