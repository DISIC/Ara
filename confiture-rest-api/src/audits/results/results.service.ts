import { AuditType, CriterionResultStatus } from "../../generated/prisma/client";
import { PrismaService } from "../../prisma.service";
import { CRITERIA_BY_AUDIT_TYPE } from "../criteria";
import { CriterionResultDto } from "../dto/entities/criterion-result.dto";
import { RESULT_PRISMA_SELECT } from "../prisma-selects";

export class ResultsService {
  constructor(private readonly prisma: PrismaService) { }

  async getResults(uniqueId: string, slug: string): Promise<CriterionResultDto[]> {
    const [audit, page] = await Promise.all([
      // fetch audit type
      this.prisma.audit.findUnique({
        where: { editUniqueId: uniqueId },
        select: { auditType: true }
      }),
      // fetch page with associated results
      this.prisma.auditedPage.findFirst({
        where: {
          OR: [
            // search for normal pages
            {
              auditUniqueId: uniqueId
            },
            // search for transverse page
            {
              auditTransverse: {
                editUniqueId: uniqueId
              }
            }
          ],
          slug
        },
        select: {
          id: true,
          name: true,
          results: {
            select: RESULT_PRISMA_SELECT
          }
        }
      })
    ]);

    if (!audit || !page) {
      return null;
    }

    // add placeholder results
    const results = this.getResultsWithPlaceholders(page.id, audit.auditType, page.results);

    return results;
  }

  /**
   * Returns an array of results so that even if some are missing in the
   * database, we get all 106 criteria in the result array
   * (or 25, or 50, depending on the audit type).
   *
   * For example, if we have only 3 results in db :
   * ```
   * [r1, r2, r4] -> [r1, r2, r3 (filler), r4, r5 (filler), ..., r106 (filler)]
   * ```
   */
  private getResultsWithPlaceholders(pageId: number, auditType: AuditType, existingResults: CriterionResultDto[]): CriterionResultDto[] {
    return CRITERIA_BY_AUDIT_TYPE[auditType].map((criterion) => {
      const existingResult = existingResults.find(
        (result) =>
          result.pageId === pageId &&
          result.topic === criterion.topic &&
          result.criterium == criterion.criterium
      );

      // return real result
      if (existingResult) return existingResult;

      // return placeholder result
      return {
        status: CriterionResultStatus.NOT_TESTED,
        compliantComment: null,
        notCompliantComment: null,
        userImpact: null,
        notApplicableComment: null,
        exampleImages: [],
        quickWin: false,

        topic: criterion.topic,
        criterium: criterion.criterium,
        pageId: pageId
      };
    });
  }
}
