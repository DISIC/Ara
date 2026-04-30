import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@Controller("/")
@ApiTags("System")
export class HealthCheckController {
  @Get("/healthcheck")
  checkHealth() {
    return "Ara REST api is live!";
  }
}
