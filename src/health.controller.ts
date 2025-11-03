import { Controller, Get } from '@nestjs/common';

@Controller() // корень => /api/health
export class HealthController {
  @Get('health')
  health() {
    return { ok: true };
  }
}
