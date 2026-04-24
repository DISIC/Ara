import { CriterionResultUserImpact } from "src/generated/prisma/enums";

export class NotCompliantItemDto {
  id: number;
  title: string | null;
  comment: string | null;
  userImpact: CriterionResultUserImpact | null;
  quickWin: boolean;
}
