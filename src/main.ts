import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Bootstrap the NestJS application.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const port = process.env['PORT'] || 3000;
  await app.listen(port);
  console.log(`Turntable API running on http://localhost:${port}`);
}

bootstrap();

