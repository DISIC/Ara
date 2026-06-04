import { Injectable } from "@nestjs/common";
import { PrismaClientKnownRequestError } from "../generated/prisma/internal/prismaNamespace";

import { PrismaService } from "../prisma.service";
import { PatchProfileDto } from "./patch-profile.dto";

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async patchProfile(userEmail: string, body: PatchProfileDto) {
    try {
      const user = await this.prisma.user.update({
        where: { username: userEmail },
        data: { name: body.name },
        select: { id: true, username: true, name: true }
      });

      return user;
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
