import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import got from 'got';
import { NewFeedbackDto } from './new-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private readonly config: ConfigService) {}

  async saveFeedback(feedback: NewFeedbackDto) {
    const data = {
      parent: {
        database_id: this.config.get('NOTION_DATABASE_ID'),
      },
      properties: {
        ...(feedback.name && {
          Name: {
            title: [
              {
                text: {
                  content: 'Pouet',
                },
              },
            ],
          },
        }),
        Feedback: {
          rich_text: [
            {
              text: {
                content: feedback.feedback,
              },
            },
          ],
        },
        ...(feedback.email && {
          Email: {
            email: feedback.email,
          },
        }),
        ...(feedback.occupations && {
          Occupations: {
            multi_select: feedback.occupations.map((occupation) => ({
              name: occupation,
            })),
          },
        }),
      },
    };

    const response = await got
      .post('https://api.notion.com/v1/pages', {
        json: data,
        headers: {
          Authorization: `Bearer ${this.config.get('NOTION_ACCESS_TOKEN')}`,
          'Notion-Version': '2022-06-28',
        },
      })
      .json<{ id: string }>();

    console.log('Added feedback to notion database : %s', response.id);
  }
}
