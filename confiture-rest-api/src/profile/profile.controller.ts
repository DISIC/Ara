import {
  Body,
  Controller,
  Get,
  Patch,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiGoneResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthRequired } from '../auth/auth-required.decorator';
import { AuthenticationJwtPayload } from '../auth/jwt-payloads';
import { User } from '../auth/user.decorator';
import { ProfileService } from './profile.service';
import { User as UserDto } from '../generated/nestjs-dto/user.entity';
import { PatchProfileDto } from './patch-profile.dto';

@Controller('profile')
@ApiTags('User Profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @AuthRequired()
  @ApiOkResponse({ type: UserDto })
  getProfile(@User() user: AuthenticationJwtPayload) {
    return this.profileService.getUserProfile(user.email);
  }

  /**
   * Patch a user profile.
   */
  @Patch()
  @AuthRequired()
  @ApiOkResponse({
    description: 'The profile has been successfully patched',
  })
  async patchProfile(
    @User() user: AuthenticationJwtPayload,
    @Body() body: PatchProfileDto,
  ) {
    const userProfile = await this.profileService.patchProfile(
      user.email,
      body,
    );

    if (!userProfile) {
      throw new UnauthorizedException();
    }

    return userProfile;
  }
}
