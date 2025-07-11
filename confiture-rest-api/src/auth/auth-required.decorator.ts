import { UseGuards, applyDecorators } from "@nestjs/common";
import { ApiBearerAuth, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { AuthGuard } from "./auth.guard";

export function AuthRequired() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiUnauthorizedResponse({
      description: "You must authenticate yourself using a bearer token."
    }),
    UseGuards(AuthGuard)
  );
}
