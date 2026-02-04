import { Module } from "@nestjs/common";
import { AuthModule } from "src/auth/auth.module";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";

@Module({
  imports: [AuthModule],
  providers: [ProfileService],
  controllers: [ProfileController]
})
export class ProfileModule {}
