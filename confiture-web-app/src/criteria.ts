import rgaa from "./criteres.json";
import { AuditType } from "./types";

interface CriteriumId {
  topic: number;
  criterium: number;
}

export const CRITERIA = rgaa.topics.flatMap((topic) =>
  topic.criteria.map((c) => ({
    topic: topic.number,
    criterium: c.criterium.number
  }))
);

/**
 * Criteria list for "fast" audits.
 * Source: https://design.numerique.gouv.fr/outils/audit-rapide/
 */
export const FAST_CRITERIA = [
  { topic: 1, criterium: 1 },
  { topic: 3, criterium: 1 },
  { topic: 4, criterium: 1 },
  { topic: 4, criterium: 10 },
  { topic: 5, criterium: 3 },
  { topic: 5, criterium: 7 },
  { topic: 6, criterium: 1 },
  { topic: 6, criterium: 2 },
  { topic: 7, criterium: 1 },
  { topic: 7, criterium: 3 },
  { topic: 8, criterium: 3 },
  { topic: 8, criterium: 4 },
  { topic: 8, criterium: 5 },
  { topic: 9, criterium: 1 },
  { topic: 10, criterium: 3 },
  { topic: 10, criterium: 6 },
  { topic: 10, criterium: 7 },
  { topic: 11, criterium: 1 },
  { topic: 11, criterium: 2 },
  { topic: 11, criterium: 5 },
  { topic: 11, criterium: 6 },
  { topic: 11, criterium: 9 },
  { topic: 11, criterium: 10 },
  { topic: 12, criterium: 8 },
  { topic: 12, criterium: 9 }
];

/**
 * Criteria list for "complementary" audits.
 * Source:
 * - https://design.numerique.gouv.fr/outils/audit-rapide/
 * - https://design.numerique.gouv.fr/outils/audit-complementaire/
 */
export const COMPLEMENTARY_CRITERIA = [
  ...FAST_CRITERIA,
  { topic: 1, criterium: 3 },
  { topic: 1, criterium: 5 },
  { topic: 1, criterium: 6 },
  { topic: 1, criterium: 7 },
  { topic: 4, criterium: 2 },
  { topic: 4, criterium: 4 },
  { topic: 4, criterium: 8 },
  { topic: 4, criterium: 9 },
  { topic: 5, criterium: 4 },
  { topic: 5, criterium: 6 },
  { topic: 7, criterium: 2 },
  { topic: 8, criterium: 2 },
  { topic: 8, criterium: 6 },
  { topic: 8, criterium: 10 },
  { topic: 10, criterium: 2 },
  { topic: 10, criterium: 8 },
  { topic: 10, criterium: 9 },
  { topic: 10, criterium: 10 },
  { topic: 13, criterium: 1 },
  { topic: 13, criterium: 3 },
  { topic: 13, criterium: 4 },
  { topic: 13, criterium: 5 },
  { topic: 13, criterium: 6 },
  { topic: 13, criterium: 7 },
  { topic: 13, criterium: 8 }
];

export const CRITERIA_BY_AUDIT_TYPE: Record<AuditType, CriteriumId[]> = {
  [AuditType.FULL]: CRITERIA,
  [AuditType.FAST]: FAST_CRITERIA,
  [AuditType.COMPLEMENTARY]: COMPLEMENTARY_CRITERIA
};

export const LINKED_CRITERIA = {
  1.1: [1.3],
  1.6: [1.7],
  2.1: [2.2],
  4.1: [4.2],
  4.3: [4.4],
  4.5: [4.6],
  4.8: [4.9],
  5.1: [5.2],
  5.4: [5.5],
  8.3: [8.4],
  8.5: [8.6],
  8.7: [8.8],
  10.9: [10.1],
  11.1: [11.2],
  11.5: [11.6, 11.7],
  12.3: [12.4],
  13.3: [13.4],
  13.5: [13.6]
};
