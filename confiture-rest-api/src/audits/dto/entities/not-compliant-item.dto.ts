import { ApiProperty } from "@nestjs/swagger";
import { CriterionResultUserImpact } from "src/generated/prisma/enums";

export class NotCompliantItemDto {
  id: number;
  title: string | null;
  comment: string | null;
  @ApiProperty({ enum: CriterionResultUserImpact })
  userImpact: CriterionResultUserImpact | null;
  quickWin: boolean;
}
