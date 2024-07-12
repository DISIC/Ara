import { groupBy } from "lodash-es";

import rgaa from "../../criteres.json";
import { ReportStoreState } from "../../store";
import { CriteriumResultStatus, ReportCriteriumResult } from "../../types";

export type ReportImprovement = {
  id: number;
  url: string;
  order: number;
  name: string;
  topics: {
    number: number;
    name?: string;
    improvements: {
      criterium: number;
      comment: string | null;
      status: CriteriumResultStatus;
    }[];
  }[];
};

export function getReportImprovements(
  reportData: ReportStoreState
): ReportImprovement[] {
  return (
    reportData.data?.context.samples
      .map((pageSample) => {
        return {
          ...pageSample,
          topics: Object.entries(
            groupBy(
              reportData.data?.results.filter(resultIsFromPage(pageSample.id)),
              "topic"
            )
          )
            .map(([topic, results]) => {
              return {
                number: Number(topic),
                name: getTopicName(Number(topic)),
                improvements: results
                  .filter(hasImprovement)
                  .map(getImprovementObject)
              };
            })
            .filter(hasOneOrMoreImprovements)
        };
      })
      .filter(hasOneOrMoreTopics) || []
  );
}

const hasOneOrMoreTopics = (p: { topics: unknown[] }) => p.topics.length > 0;

const hasOneOrMoreImprovements = (t: { improvements: unknown[] }) =>
  t.improvements.length > 0;

const hasImprovement = (r: ReportCriteriumResult) =>
  (r.status === CriteriumResultStatus.COMPLIANT && r.compliantComment) ||
  (r.status === CriteriumResultStatus.NOT_APPLICABLE && r.notApplicableComment);

const getImprovementObject = (r: ReportCriteriumResult) => {
  return {
    criterium: r.criterium,
    status: r.status,
    comment: r.compliantComment || r.notApplicableComment
  };
};

const resultIsFromPage = (pageId: number) => (result: ReportCriteriumResult) =>
  result.pageId === pageId;

function getTopicName(topicNumber: number) {
  return rgaa.topics.find((t) => t.number === topicNumber)?.topic;
}
