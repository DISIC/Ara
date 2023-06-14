import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthRequired } from '../auth/auth-required.decorator';
import { AuthenticationJwtPayload } from '../auth/jwt-payloads';
import { User } from '../auth/user.decorator';
import { ProfileService } from './profile.service';
import { User as UserDto } from '../generated/nestjs-dto/user.entity';

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
}
