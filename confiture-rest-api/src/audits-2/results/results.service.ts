import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { ResultDto, ResultsResponseDto } from "./dto/results-response.dto";
import { UpdateResultRequestDto } from "./dto/update-result-request.dto";

@Injectable()
export class ResultsService {
  constructor(private readonly prisma: PrismaService) {}

  //
  // CRUD methods
  //

  async getResults(
    uniqueId: string,
    slug: string
  ): Promise<ResultsResponseDto> {
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

  async updateResult(
    uniqueId: string,
    slug: string,
    criterion: string,
    data: UpdateResultRequestDto
  ): Promise<ResultDto> {
    const [topicNumber, criterionNumber] = criterion.split(".").map(Number);

    return await this.prisma.criterionResult.update({
      where: {
        pageId_topic_criterium: {
          topic: topicNumber,
          criterium: criterionNumber,
          pageId: data.pageId
        }
      },
      data,
      include: { exampleImages: true }
    });
  }

  //
  // Action methods
  //

  async prefillNotApplicableTopics(
    _auditUniqueId: string,
    _notApplicableTopics: number[]
  ) {
    // TODO: implement this
    return;
  }
}
