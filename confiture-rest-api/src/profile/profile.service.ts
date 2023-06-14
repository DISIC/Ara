import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserProfile(userEmail: string) {
    return this.prisma.user.findUnique({
      where: { username: userEmail },
      select: { id: true, username: true },
    });
  }
}
