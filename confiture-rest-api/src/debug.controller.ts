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

  @Post("create-verified-user")
  async createVerifiedUser() {
    const email = `john-doe${Math.random()}@example.com`;
    const password = "pouetpouetpouet";

    await this.auth.createUnverifiedUser(email, password);
    await this.prisma.user.update({
      data: {
        isVerified: true,
        verificationJti: null
      },
      where: {
        username: email
      }
    });

    return {
      username: email,
      password: password
    };
  }
}
