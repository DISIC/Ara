import { ResultDto } from "./result.dto";

export class GetPageWithResultsDto {
  id: number;
  name: string;
  results: ResultDto[];
}
