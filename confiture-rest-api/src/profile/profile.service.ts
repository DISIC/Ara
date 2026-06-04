import { Injectable } from "@nestjs/common";
import { PrismaClientKnownRequestError } from "../generated/prisma/internal/prismaNamespace";

import { PrismaService } from "../prisma.service";
import { PatchProfileDto } from "./patch-profile.dto";

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async patchProfile(userEmail: string, body: PatchProfileDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
          where: { username: userEmail },
          data: { name: body.name },
          select: { id: true, username: true, name: true }
        });

        // Update user audits auditorName
        await tx.audit.updateMany({
          where: {
            auditorEmail: userEmail
          },
          data: {
            auditorName: body.name
          }
        });

        return user;
      });
    } catch (e) {
      // User does not exist
      // https://www.prisma.io/docs/orm/reference/error-reference#p2025
      if (e instanceof PrismaClientKnownRequestError && e.code === "P2025") {
        return;
      }
      throw e;
    }
  }
}
