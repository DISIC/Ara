import { Global, Module } from "@nestjs/common";
import { PermissionsService } from "./permissions.service";

@Global()
@Module({
  providers: [PermissionsService],
  exports: [PermissionsService]
})
export class PermissionsModule {}
