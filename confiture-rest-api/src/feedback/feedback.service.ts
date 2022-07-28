import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import got from 'got';
import { NewFeedbackDto } from './new-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private readonly config: ConfigService) {}

  async saveFeedback(feedback: NewFeedbackDto) {
    const data = {
      records: [
        {
          fields: {
            // 'Facile à utiliser': '',
            // 'Facile à comprendre': '',
            'Remarques générales': feedback.feedback,
            // Suggestions: '',
            Nom: feedback.name,
            Email: feedback.email,
            Occupations: feedback.occupations,
          },
        },
      ],
    };

    const response = await got
      .post(
        `https://api.airtable.com/v0/${this.config.get(
          'AIRTABLE_BASE_ID',
        )}/${this.config.get('AIRTABLE_TABLE_ID')}`,
        {
          json: data,
          headers: {
            Authorization: `Bearer ${this.config.get('AIRTABLE_ACCESS_TOKEN')}`,
            // 'Notion-Version': '2022-06-28',
          },
        },
      )
      .json<{ id: string }>();

    console.log('Added feedback to notion database : %s', response.id);
  }
}
