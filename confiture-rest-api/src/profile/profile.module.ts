import { Module } from "@nestjs/common";
import { AuthModule } from "src/auth/auth.module";
import { PrismaService } from "src/prisma.service";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";

@Module({
  imports: [AuthModule],
  providers: [ProfileService, PrismaService],
  controllers: [ProfileController]
})
export class ProfileModule {}
