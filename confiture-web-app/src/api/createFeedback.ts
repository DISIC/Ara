import ky from "ky";

import { CreateFeedbackRequestData } from "../types";

export async function createFeedback(
  data: CreateFeedbackRequestData
): Promise<void> {
  await ky.post("/api/feedback", {
    json: data,
  });
}
