import * as rgaa from '../rgaa.json';

export const CRITERIA = rgaa.topics.flatMap((topic) =>
  topic.criteria.map((c) => ({
    topic: topic.number,
    criterium: c.criterium.number,
  })),
);
