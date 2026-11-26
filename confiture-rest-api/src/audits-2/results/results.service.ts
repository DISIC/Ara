import { Injectable } from "@nestjs/common";
import { AuditType } from "../../generated/prisma/enums";
import { PrismaService } from "../../prisma.service";
import { CRITERIA_BY_AUDIT_TYPE } from "./criteria";
import { ResultResponseDto } from "./dto/result-response.dto";
import { UpdateResultRequestDto } from "./dto/update-result-request.dto";
import { UpdateResultsRequestDto } from "./dto/update-results-request.dto";

@Injectable()
export class ResultsService {
  constructor(private readonly prisma: PrismaService) {}

  //
  // CRUD methods
  //

  async getResults(
    uniqueId: string,
    slug: string
  ): Promise<ResultResponseDto[]> {
    // TODO: return placeholder results
    const audit = await this.prisma.audit.findUniqueOrThrow({
      where: {
        editUniqueId: uniqueId,
        isHidden: false
      },
      select: { auditType: true }
    });

    const results = await this.prisma.auditedPage
      .findUniqueOrThrow({
        where: {
          auditUniqueId_slug: {
            auditUniqueId: uniqueId,
            slug
          },
          audit: {
            isHidden: false
          }
        }
      })
      .results({ include: { exampleImages: true } });

    return ResultsService.filterResults(results, audit.auditType);
  }

  async updateResult(
    uniqueId: string,
    slug: string,
    topic: number,
    criterion: number,
    data: UpdateResultRequestDto
  ): Promise<ResultResponseDto> {
    const page = await this.prisma.auditedPage.findUniqueOrThrow({
      where: {
        auditUniqueId_slug: {
          auditUniqueId: uniqueId,
          slug
        },
        audit: {
          isHidden: false
        }
      }
    });

    const result = await this.prisma.criterionResult.update({
      where: {
        pageId_topic_criterium: {
          pageId: page.id,
          topic,
          criterium: criterion
        }
      },
      data: {
        status: data.status,
        compliantComment: data.compliantComment,
        notApplicableComment: data.notApplicableComment
      },
      include: {
        exampleImages: true
      }
    });

    // TODO: update stuff after result update

    return result;
  }

  async updateResults(
    uniqueId: string,
    slug: string,
    data: UpdateResultsRequestDto[]
  ): Promise<void> {
    await this.prisma.auditedPage.update({
      where: {
        auditUniqueId_slug: {
          auditUniqueId: uniqueId,
          slug
        },
        audit: {
          isHidden: false
        }
      },
      data: {
        results: {
          updateMany: data.map((dto) => ({
            data: {
              status: dto.status,
              compliantComment: dto.compliantComment,
              notApplicableComment: dto.notApplicableComment
            },
            where: {
              topic: dto.topic,
              criterium: dto.criterion
            }
          }))
        }
      },
      include: {
        results: true
      }
    });

    // TODO: update stuff after result update
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

  //
  // Utility methods
  //

  /** Filter given results depending on audit type. */
  static filterResults<R extends { topic: number; criterium: number }>(
    results: R[],
    auditType: AuditType
  ): R[] {
    return results.filter((r) =>
      CRITERIA_BY_AUDIT_TYPE[auditType].some(
        (c) => c.topic === r.topic && c.criterium === r.criterium
      )
    );
  }
}
