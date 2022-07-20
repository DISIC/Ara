import { Body, Controller, Post } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { NewFeedbackDto } from './new-feedback.dto';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  async sendFeedback(@Body() body: NewFeedbackDto) {
    await this.feedbackService.saveFeedback(body);
  }
}
