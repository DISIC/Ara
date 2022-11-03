import { Controller, Get } from "@nestjs/common";

@Controller('/')
export class HealthCheckController {
  @Get('/healthcheck')
  checkHealth() {
    return "Confiture REST api is live !"
  }
}