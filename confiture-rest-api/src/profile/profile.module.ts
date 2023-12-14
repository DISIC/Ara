import { Module } from "@nestjs/common";
import { ProfileController } from "./profile.controller";
import { AuthModule } from "src/auth/auth.module";
import { ProfileService } from "./profile.service";
import { PrismaService } from "src/prisma.service";

@Module({
  imports: [AuthModule],
  providers: [ProfileService, PrismaService],
  controllers: [ProfileController]
})
export class ProfileModule {}
