import { groupBy, mapValues, sortBy, uniqWith } from "lodash-es";

import rgaa from "../../criteres.json";
import { ReportStoreState } from "../../store";
import {
  AuditReport,
  CriterionResultUserImpact,
  CriteriumResultStatus,
  ReportCriteriumResult
} from "../../types";

export type ReportErrors = {
  id: number;
  name?: string;
  order: number;
  url: string;
  topics: {
    topic: number;
    name?: string;
    errors: ReportCriteriumResult[];
  }[];
};

export function getReportErrors(
  report: ReportStoreState,
  quickWinFilter: boolean,
  userImpactFilters: Array<CriterionResultUserImpact | null>
): ReportErrors[] {
  const resultsGroupedByPage = {
    // include pages with no errors
    ...report.data?.context.samples.reduce<Record<string, []>>((acc, val) => {
      acc[val.id] = [];
      return acc;
    }, {}),

    ...groupBy(
      report.data?.results
        .filter((r) => {
          return (
            r.status === CriteriumResultStatus.NOT_COMPLIANT &&
            !r.transverse &&
            userImpactFilters.includes(r.userImpact)
          );
        })
        .filter((r) => {
          return quickWinFilter ? r.quickWin : r;
        }),
      "pageId"
    )
  } as Record<number, AuditReport["results"]>;

  return sortBy(
    Object.entries(resultsGroupedByPage).map(([pageId, results]) => {
      return {
        id: Number(pageId),
        order: getPage(report, pageId).order,
        name: getPage(report, pageId).name,
        url: getPage(report, pageId).url,
        topics: sortBy(
          Object.values(
            mapValues(groupBy(results, "topic"), (results, topicNumber) => {
              return {
                topic: Number(topicNumber),
                name: getTopicName(Number(topicNumber)),
                errors: sortBy(
                  results.filter((r) => !r.transverse),
                  "criterium"
                )
              };
            })
          ),
          "topic"
        )
      };
    }),
    (el) => el.order
  );
}

function getPage(report: ReportStoreState, pageId: number | string) {
  return report.data!.context.samples.find((p) => p.id === Number(pageId))!;
}

export type ReportTransverseError = {
  topic: number;
  name?: string;
  errors: ReportCriteriumResult[];
};

export function getReportTransverseErrors(
  report: ReportStoreState,
  userImpactFilters: Array<CriterionResultUserImpact | null>
): ReportTransverseError[] {
  return Object.values(
    mapValues(
      groupBy(
        uniqWith(
          report.data?.results.filter((r) => {
            return (
              r.transverse &&
              r.status === CriteriumResultStatus.NOT_COMPLIANT &&
              userImpactFilters.includes(r.userImpact)
            );
          }),
          (a, b) => a.criterium === b.criterium && a.topic === b.topic
        ),
        "topic"
      ),
      (results, topicNumber) => {
        return {
          topic: Number(topicNumber),
          name: getTopicName(Number(topicNumber)),
          errors: results
        };
      }
    )
  );
}

function getTopicName(topicNumber: number) {
  return rgaa.topics.find((t) => t.number === topicNumber)?.topic;
}
