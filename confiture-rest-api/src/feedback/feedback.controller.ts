import { Body, Controller, Post } from "@nestjs/common";
import { ApiCreatedResponse } from "@nestjs/swagger";
import { FeedbackService } from "./feedback.service";
import { NewFeedbackDto } from "./dto/new-feedback.dto";
import { AccountDeletionFeedbackDto } from "./dto/account-deletion-feedback.dto";

@Controller("feedback")
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  /**
   * Save the feedback data to the linked Grist database.
   */
  @Post()
  @ApiCreatedResponse({
    description: "The record has been successfully created."
  })
  async sendFeedback(@Body() body: NewFeedbackDto) {
    await this.feedbackService.saveFeedback(body);
  }

  @Post("account-deleted")
  async sendAccountDeletionFeedback(@Body() body: AccountDeletionFeedbackDto) {
    await this.feedbackService.saveAccountDeletionFeedback(
      body.feedback,
      body.feedbackToken
    );
  }
}
