import { Body, Controller, Patch, UnauthorizedException } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthRequired } from '../auth/auth-required.decorator';
import { AuthenticationJwtPayload } from '../auth/jwt-payloads';
import { User } from '../auth/user.decorator';
import { PatchProfileDto } from './patch-profile.dto';
import { ProfileService } from './profile.service';

@Controller('profile')
@ApiTags('User Profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

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
  }
}
