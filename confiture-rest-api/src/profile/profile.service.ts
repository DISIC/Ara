import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

import { PatchProfileDto } from './patch-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserProfile(userEmail: string) {
    return this.prisma.user.findUnique({
      where: { username: userEmail },
      select: { id: true, username: true, name: true, orgName: true },
    });
  }

  async patchProfile(userEmail: string, body: PatchProfileDto) {
    try {
      const user = await this.prisma.user.update({
        where: { username: userEmail },
        data: { name: body.name, orgName: body.orgName },
        select: { id: true, username: true, name: true, orgName: true },
      });

      return user;
    } catch (e) {
      // User does not exist
      // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
      if (e?.code === 'P2025') {
        return;
      }
      throw e;
    }
  }
}
