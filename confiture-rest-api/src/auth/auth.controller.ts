import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Post,
  Put,
  UnauthorizedException
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse
} from "@nestjs/swagger";

import { FeedbackService } from "../feedback/feedback.service";
import { User } from "../generated/prisma/client";
import { MailService } from "../mail/mail.service";
import { AuthRequired } from "./auth-required.decorator";
import { AuthService, SigninError } from "./auth.service";
import { DeleteAccountResponseDto } from "./dto/delete-account-response.dto";
import { DeleteAccountDto } from "./dto/delete-account.dto";
import { SigninDto } from "./dto/signin.dto";
import { UpdatePasswordDto } from "./dto/update-password.dto";
import { User as CurrentUser } from "./user.decorator";

@Controller("auth")
@ApiTags("Authentication")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly email: MailService,
    private readonly feedback: FeedbackService
    // private readonly audit: AuditService
  ) {}

  /**
   * Login using *username and password*. An authentication token is returned.
   *
   * The authentication token should be included in HTTP requests using the `Authorization` header.
   *
   * See: https://swagger.io/docs/specification/authentication/bearer-authentication/
   */
  @Post("signin")
  @ApiCreatedResponse({
    description: "Successfully authenticated.",
    type: String
  })
  @ApiUnauthorizedResponse({
    description:
      "Invalid credentials."
  })
  async signin(@Body() body: SigninDto): Promise<string> {
    try {
      return await this.auth.signin(body.username, body.password);
    } catch (e) {
      if (e instanceof SigninError) {
        throw new UnauthorizedException();
      }
      throw e;
    }
  }

  @Post("refresh")
  @AuthRequired()
  @ApiCreatedResponse({ type: String })
  async refreshToken(@CurrentUser() user: User): Promise<string> {
    try {
      return await this.auth.refreshToken(user.uid);
    } catch (e) {
      if (e instanceof SigninError) {
        throw new UnauthorizedException();
      }
      throw e;
    }
  }

  @Delete("account")
  @ApiOkResponse({
    description: "The account was succesfully deleted.",
    type: DeleteAccountResponseDto
  })
  @AuthRequired()
  async deleteAccount(
    @Body() body: DeleteAccountDto,
    @CurrentUser() user: User
  ): Promise<DeleteAccountResponseDto> {
    if (!(await this.auth.checkCredentials(user.username, body.password))) {
      throw new UnauthorizedException();
    }

    // TODO: emit an event and handle the event in AuditService
    // await this.audit.softDeleteAuditsByAuditorEmail(user.email);

    const feedbackToken = await this.feedback.generateFeedbackToken();

    await this.auth.deleteAccount(user.username);

    return {
      feedbackToken
    };
  }

  @Put("update-password")
  @ApiOkResponse({
    description: "The password was succesfully updated."
  })
  @ApiBadRequestResponse({
    description: "The new password is identical to the old password."
  })
  @ApiUnauthorizedResponse({
    description: "Wrong old password or invalid bearer token."
  })
  @AuthRequired()
  async updatePassword(
    @Body() body: UpdatePasswordDto,
    @CurrentUser() user: User
  ) {
    const passwordCheck = await this.auth.checkCredentials(
      user.username,
      body.oldPassword
    );

    if (!passwordCheck) {
      throw new UnauthorizedException();
    }

    if (body.newPassword === body.oldPassword) {
      throw new BadRequestException();
    }

    await this.auth.updatePassword(user.username, body.newPassword);

    this.email.sendPasswordUpdateConfirmation(user.username).catch((err) => {
      console.error(`Failed to send email for password update ${user.username}`);
      console.error(err);
    });

    return;
  }
}
