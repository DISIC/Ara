import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";

@Module({
  imports: [AuthModule],
  providers: [ProfileService],
  controllers: [ProfileController]
})
export class ProfileModule {}
