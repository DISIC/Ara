import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import got, { HTTPError } from 'got';
import { NewFeedbackDto } from './new-feedback.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { nanoid } from 'nanoid';

@Injectable()
export class FeedbackService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  private async sendDataToAirtable(data: any) {
    const response = await got
      .post(
        `https://api.airtable.com/v0/${this.config.get(
          'AIRTABLE_BASE_ID',
        )}/${this.config.get('AIRTABLE_TABLE_ID')}`,
        {
          json: data,
          headers: {
            Authorization: `Bearer ${this.config.get('AIRTABLE_ACCESS_TOKEN')}`,
          },
        },
      )
      .json<{ records: { id: string }[] }>()
      .catch((err) => {
        if (err instanceof HTTPError) {
          console.log('Failed to submit to airtable');
          console.log(err.response.body);
        }
        throw err;
      });

    console.log('Added feedback to Airtable : %s', response.records[0].id);
  }

  async saveFeedback(feedback: NewFeedbackDto) {
    const data = {
      records: [
        {
          fields: {
            'Facile à utiliser': feedback.easyToUse,
            'Facile à comprendre': feedback.easyToUnderstand,
            'Remarques générales': feedback.feedback,
            Suggestions: feedback.suggestions,
            Nom: feedback.name,
            Contact: feedback.email,
            Expertises: feedback.occupations,
            Source: 'Formulaire de satisfaction',
          },
        },
      ],
    };
    await this.sendDataToAirtable(data);
  }

  /** Generate a single use token to be given to the API along account deletion feedback. */
  async generateFeedbackToken() {
    const payload = {
      feedback: 'accountDeletion',
      jti: nanoid(),
    };
    const token = await this.jwt.signAsync(payload);
    await this.prisma.activeFeedbackToken.create({
      data: { uid: payload.jti },
    });
    return token;
  }

  async saveAccountDeletionFeedback(feedback: string, feedbackToken: string) {
    const jti = await this.verifyFeedbackToken(feedbackToken);
    const data = {
      records: [
        {
          fields: {
            'Remarques générales': feedback,
            Source: 'Suppression de compte',
          },
        },
      ],
    };
    await this.sendDataToAirtable(data);
    await this.consumeFeedbackToken(jti);
  }

  /** Check the given token is valid. If not throw an UnauthorizedException (401) */
  private async verifyFeedbackToken(token: string) {
    try {
      const payload = await this.jwt.verifyAsync(token);

      if (payload?.feedback !== 'accountDeletion' || !payload?.jti) {
        throw 'Wrong token format';
      }

      await this.prisma.activeFeedbackToken.findUniqueOrThrow({
        where: { uid: payload.jti },
      });

      return payload.jti;
    } catch (e) {
      throw new UnauthorizedException('Invalid feedback token');
    }
  }

  /** Consume the feedback token so that the user cannot send multiple account deletion feedbacks without... deleting their account. */
  private async consumeFeedbackToken(jti: string) {
    await this.prisma.activeFeedbackToken.delete({
      where: { uid: jti },
    });
  }
}
