import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import got, { HTTPError } from "got";
import { nanoid } from "nanoid";
import { PrismaService } from "src/prisma.service";

import { NewFeedbackDto } from "./dto/new-feedback.dto";

@Injectable()
export class FeedbackService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService
  ) {}

  private async sendDataToGrist(data: any) {
    const response = await got
      .post(
        `https://grist.numerique.gouv.fr/api/docs/${this.config.get(
          "GRIST_DOC_ID"
        )}/tables/${this.config.get("GRIST_TABLE_ID")}/records`,
        {
          json: data,
          headers: {
            Authorization: `Bearer ${this.config.get("GRIST_API_KEY")}`
          }
        }
      )
      .json<{ records: { id: string }[] }>()
      .catch((err) => {
        if (err instanceof HTTPError) {
          console.log("Failed to submit to Grist");
          console.log(err.response.body);
        }
        throw err;
      });

    console.log("Added feedback to Grist: %s", response.records[0].id);
  }

  async saveFeedback(feedback: NewFeedbackDto) {
    const data = {
      records: [
        {
          fields: {
            Facile_a_utiliser: feedback.easyToUse,
            Facile_a_comprendre: feedback.easyToUnderstand,
            Remarques_generales: feedback.feedback,
            Suggestions: feedback.suggestions,
            Nom: feedback.name,
            Contact: feedback.email,
            // For some reason, "L" is required for ChoiceList column type
            Expertises: ["L", ...(feedback.occupations || [])],
            Source: "Formulaire de satisfaction",
            Date: new Date().toISOString()
          }
        }
      ]
    };
    await this.sendDataToGrist(data);
  }

  /** Generate a single use token to be given to the API along account deletion feedback. */
  async generateFeedbackToken() {
    const payload = {
      feedback: "accountDeletion",
      jti: nanoid()
    };
    const token = await this.jwt.signAsync(payload);
    await this.prisma.activeFeedbackToken.create({
      data: { uid: payload.jti }
    });
    return token;
  }

  async saveAccountDeletionFeedback(feedback: string, feedbackToken: string) {
    const jti = await this.verifyFeedbackToken(feedbackToken);
    const data = {
      records: [
        {
          fields: {
            Remarques_generales: feedback,
            Source: "Avis suppression de compte"
          }
        }
      ]
    };
    await this.sendDataToGrist(data);
    await this.consumeFeedbackToken(jti);
  }

  /** Check the given token is valid. If not throw an UnauthorizedException (401) */
  private async verifyFeedbackToken(token: string) {
    try {
      const payload = await this.jwt.verifyAsync(token);

      if (payload?.feedback !== "accountDeletion" || !payload?.jti) {
        throw "Wrong token format";
      }

      await this.prisma.activeFeedbackToken.findUniqueOrThrow({
        where: { uid: payload.jti }
      });

      return payload.jti;
    } catch {
      throw new UnauthorizedException("Invalid feedback token");
    }
  }

  /** Consume the feedback token so that the user cannot send multiple account deletion feedbacks without... deleting their account. */
  private async consumeFeedbackToken(jti: string) {
    await this.prisma.activeFeedbackToken.delete({
      where: { uid: jti }
    });
  }
}
