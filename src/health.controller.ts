import { Controller, Get } from '@nestjs/common';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  getHealth() {
    const isConnected = this.connection.readyState === 1; // 1 = connected
    return { status: isConnected ? 'ok' : 'error' };
  }
}
