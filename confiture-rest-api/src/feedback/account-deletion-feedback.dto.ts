import { IsString } from "class-validator";

export class AccountDeletionFeedbackDto {
  @IsString()
  feedback: string;

  /** Token returned by the  */
  @IsString()
  feedbackToken: string;
}
