import { Body, Controller, Get, Post, Put } from "@nestjs/common";
import { ApiHideProperty } from "@nestjs/swagger";
import { PrismaService } from "./prisma.service";
import { AuthService } from "./auth/auth.service";
import { Prisma } from "@prisma/client";

@Controller("debug")
export class DebugController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService
  ) {}

  @Post("verification-token")
  async getAccountVerificationToken(@Body() body: { username: string }) {
    const token = this.auth.regenerateVerificationToken(body.username);
    return token;
  }

  @Post("password-reset-verification-token")
  async getPasswordResetVerificationToken(@Body() body: { username: string }) {
    const token = this.auth.generatePasswordResetVerificationToken(
      body.username
    );

    return token;
  }

  @Post("email-update-verification-token")
  async getEmailUpdateVerificationToken(@Body() body: { uid: string }) {
    const token = this.auth.regenerateEmailUpdateVerificationToken(body.uid);

    return token;
  }

  @Post("create-verified-user")
  async createVerifiedUser() {
    const email = `john-doe${Math.random()}@example.com`;
    const password = "pouetpouetpouet";

    await this.auth.createUnverifiedUser(email, password);
    const user = await this.prisma.user.update({
      data: {
        isVerified: true,
        verificationJti: null
      },
      where: {
        username: email
      }
    });

    const authToken = await this.auth.signin(email, password);

    return {
      username: email,
      password,
      authToken,
      uid: user.uid
    };
  }
}
