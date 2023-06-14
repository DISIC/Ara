import { UseGuards, applyDecorators } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function AuthRequired() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiUnauthorizedResponse({
      description: 'You must authenticate yourself using a bearer token.',
    }),
    UseGuards(AuthGuard),
  );
}
