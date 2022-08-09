import type { CriteriumResult } from "../types";
import ky from "ky";

export async function updateResults(
  uniqueId: string,
  results: CriteriumResult[]
) {
  await ky.patch(`/api/audits/${uniqueId}/results`, {
    json: {
      data: results,
    },
  });
}
