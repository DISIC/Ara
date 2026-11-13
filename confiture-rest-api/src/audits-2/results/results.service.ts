import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { ResultsResponseDto } from "./dto/results-response.dto";

@Injectable()
export class ResultsService {
  constructor(
    private readonly prisma: PrismaService
  ) { }

  //
  // CRUD methods
  //

  async getResults(uniqueId: string, slug: string): Promise<ResultsResponseDto> {
    const results = await this.prisma.criterionResult.findMany({
      where: {
        page: {
          auditUniqueId: uniqueId,
          slug
        }
      },
      include: { exampleImages: true }
    });

    return { data: results };
  }

  //
  // Action methods
  //

  async prefillNotApplicableTopics(_auditUniqueId: string, _notApplicableTopics: number[]) {
    // TODO: implement this
    return;
  }
}
