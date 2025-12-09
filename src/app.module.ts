import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TurntableModule } from './turntable/turntable.module';
import { HealthModule } from './health/health.module';

/**
 * Root application module.
 */
@Module({
  imports: [TurntableModule, HealthModule],
  controllers: [AppController],
})
export class AppModule {}

